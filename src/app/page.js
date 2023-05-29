"use client";
import Form from "./form";
import uiConfig from "./uiConfig";
import BotButtons from "./BotButtons";
import { usePersistentState } from "./hooks";

export default function Home() {
  const [formValues, setFormValues] = usePersistentState(
    "formValues",
    Object.entries(uiConfig).reduce(
      (obj, [key, { default: value }]) => ({ ...obj, [key]: value }),
      {}
    )
  );

  const handleChange = (event) => {
    console.log(event.target.name, event);
    let { name, value } = event.target;
    if (event.target.type === "checkbox") {
      value = event.target.checked;
    }
    if (event.target.type === "number") {
      value = Number(value);
    }
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formValues);
  };
  return (
    <main className="flex min-h-screen  mb-12 flex-col text-center content-center">
      <h1 className="text-4xl font-bold mt-4 text-black">Temu Bot</h1>
      <div className="mx-24">
        <Form
          formValues={formValues}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </div>
      <div className="flex flex-col justify-center items-center mx-8">
        <BotButtons data={formValues} />
      </div>
    </main>
  );
}
