"use client"; // This is a client component 👈🏽
import { useState } from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  FormHelperText,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { uiConfig } from "./uiConfig";
import { Fragment } from "react";

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  const daysStr = days ? days + " day(s) " : "";
  const hoursStr = hours.toString().padStart(2, "0") + " hour(s) ";
  const minutesStr = minutes.toString().padStart(2, "0") + " minute(s) ";
  const secondsStr = seconds.toString().padStart(2, "0") + " second(s)";
  if (duration < 1000) return `${duration} Milliseconds`;

  let output = "";
  if (days) output += daysStr;
  if (hours) output += hoursStr;
  if (minutes) output += minutesStr;
  if (seconds) output += secondsStr;
  return output;
};

const Form = ({ formValues, handleChange, handleSubmit }) => {
  const groupedConfig = Object.entries(uiConfig).reduce((acc, [key, value]) => {
    const group = value.group || "Others";
    if (!acc[group]) acc[group] = {};
    acc[group][key] = value;
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit}>
      <div className="my-4">
        {Object.entries(groupedConfig).map(([groupName, groupConfig]) => (
          <Accordion key={groupName}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{groupName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {Object.entries(groupConfig).map(
                  ([
                    key,
                    {
                      type,
                      name,
                      dontShow,
                      options,
                      default: defaultValue,
                      if: condition,
                      description,
                    },
                  ]) => {
                    if (dontShow) return null;
                    // Check if there are conditions for displaying this field
                    if (
                      condition &&
                      !formValues[Object.keys(condition)[0]] ===
                        Object.values(condition)[0]
                    )
                      return null;

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={type === "textarea" ? 8 : 4}
                        key={key}
                      >
                        <Box
                          border={1}
                          borderColor="grey.600"
                          borderRadius={2}
                          p={2}
                        >
                          <InputLabel>
                            {name}{" "}
                            {type === "time" && formValues[key]
                              ? `| ${msToTime(formValues[key])}`
                              : null}{" "}
                          </InputLabel>
                          <FormControl
                            fullWidth
                            margin="normal"
                            variant="outlined"
                          >
                            {type === "string" ||
                            type === "number" ||
                            type === "password" ? (
                              <TextField
                                type={
                                  type === "password" || type === "number"
                                    ? type
                                    : undefined
                                }
                                name={key}
                                value={formValues[key] || ""}
                                onChange={handleChange}
                              />
                            ) : null}

                            {type === "textarea" ? (
                              <TextField
                                multiline
                                name={key}
                                value={formValues[key] || ""}
                                onChange={handleChange}
                              />
                            ) : null}

                            {type === "boolean" ? (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name={key}
                                    checked={!!formValues[key]}
                                    onChange={handleChange}
                                  />
                                }
                                label={name}
                              />
                            ) : null}

                            {type === "pick-one" ? (
                              <Select
                                name={key}
                                value={formValues[key] || ""}
                                onChange={handleChange}
                              >
                                {options.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : null}

                            {type === "time" ? (
                              <TextField
                                type="number"
                                name={key}
                                value={formValues[key] || ""}
                                onChange={handleChange}
                              />
                            ) : null}

                            {description ? (
                              <FormHelperText>
                                {description.split("\n").map((desc, index) => (
                                  <Fragment key={desc}>
                                    <br />
                                    {desc}
                                  </Fragment>
                                ))}
                              </FormHelperText>
                            ) : null}
                          </FormControl>
                        </Box>
                      </Grid>
                    );
                  }
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </form>
  );
};

export default Form;
