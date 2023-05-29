"use client";
import { Button } from "@mui/material";
import { useEffect, useState, useRef } from "react";

const BotButtons = ({ data }) => {
  const [ws, setWs] = useState(null);
  const [ready, setReady] = useState(false);
  const [serverStatus, setServerStatus] = useState("initialized");
  const [logs, setLog] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3000");

    websocket.onopen = () => {
      setTimeout(() => setReady(true), 1000);
      console.log("Connected to WebSocket");
    };

    websocket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log("Received: " + event.data);
        if (parsedData.status) setServerStatus(parsedData.status);
        if (parsedData.type === "log") setLog(parsedData.message);
      } catch (err) {
        console.log(event.data);
      }
    };
    websocket.onclose = (event) => {
      console.log("Disconnected from WebSocket");
    };

    setWs(websocket);

    return () => {
      setWs(null);
      setReady(false);
      websocket.close();
    };
  }, []);

  const sendMessage = (command) => () => {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          command,
          payload: data,
        })
      );
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <>
      <p className="">Bot Status: {serverStatus}</p>

      {ready ? (
        <>
          {serverStatus === "offline" || serverStatus === "initialized" ? (
            <Button
              onClick={sendMessage("start")}
              type="submit"
              variant="outlined"
              color="primary"
              className="w-40"
            >
              Start Bot
            </Button>
          ) : null}
          {serverStatus === "online" ? (
            <Button
              onClick={sendMessage("stop")}
              type="submit"
              variant="outlined"
              color="primary"
              className="w-40"
            >
              Stop Bot
            </Button>
          ) : null}
        </>
      ) : (
        "Loading..."
      )}
      {/* logs */}
      <div className="flex flex-col w-full border rounded-md border-gray-800 mt-8 mx-4 px-8 pb-8 box-border">
        <h2 className="text-2xl text-black font-bold my-8">Logs</h2>
        <div className="h-64 bg-black c-white overflow-auto border rounded-md border-gray-900 mx-4">
          {logs.map((log, index) => (
            <p className="text-left" key={index}>
              {log}
            </p>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </>
  );
};

export default BotButtons;
