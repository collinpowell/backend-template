import { createLogger, format, transports } from "winston";
const { combine, timestamp, label, printf } = format;

const LOG_LABEL = "MINTO-NFT";
const LOG_TIMEZONE = "Asia/Kolkata";
const LOCALE = "en-US";

const timezoned = () => {
  return new Date().toLocaleString(LOCALE, {
    timeZone: LOG_TIMEZONE,
  });
};

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const combineFormat = combine(
  label({ label: LOG_LABEL }),
  timestamp({ format: timezoned }),
  customFormat
);

const transportsDetails = [];

if (process.env.IS_CONSOLE == "true") {
  transportsDetails.push(
    new transports.Console({
      level: process.env.LOG_LEVEL,
      format: combineFormat,
    })
  );
} else {
  transportsDetails.push(
    new transports.Console({
      level: process.env.LOG_LEVEL,
      format: combineFormat,
    })
  );
}
var logger = createLogger({
  transports: transportsDetails,
});

export default logger;
