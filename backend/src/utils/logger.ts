import { createLogger, transports, format } from "winston";
export const Logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [ new transports.Console() ],
});
