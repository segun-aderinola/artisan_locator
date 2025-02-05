import { createLogger, transports, format } from 'winston';

// Define log format (timestamp + level + message)
const logFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create the logger with the specified transports
const logger = createLogger({
  level: 'info', // Default log level
  format: format.combine(
    format.colorize(), // Colorize output for console (development)
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Custom timestamp format
    logFormat // Use the log format defined above
  ),
  transports: [
    // Console transport for development
    new transports.Console({ level: 'debug' }),

    // File transport for storing logs in production or when needed
    new transports.File({
      filename: './logs/index.log',
      level: 'error', // Only logs error level messages to the file
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} ${info.level} : ${info.message}`)
      )
    })
  ]
});

export default logger;
