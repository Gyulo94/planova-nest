import { formatInTimeZone } from 'date-fns-tz';
import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { APP_NAME, NODE_ENV } from '../constants';

interface TimestampOptions {
  tz?: string;
}

const isTimestampOptions = (opts: unknown): opts is TimestampOptions => {
  return (
    typeof opts === 'object' &&
    opts !== null &&
    ('tz' in opts ? typeof (opts as { tz?: unknown }).tz === 'string' : true)
  );
};

const apeendTimestamp = winston.format((info, opts: unknown) => {
  if (isTimestampOptions(opts) && opts.tz) {
    info.timestamp = formatInTimeZone(
      new Date(),
      opts.tz,
      'yyyy-MM-dd HH:mm:ss',
    );
  }
  return info;
});

const dailyOptions = {
  level: 'http',
  datePattern: 'YYYY-MM-DD',
  dirname: __dirname + '/../../../logs',
  filename: `${APP_NAME}.%DATE%.log`,
  maxFiles: 30,
  zippedArchive: true,
  colorize: true,
  json: false,
};

export const winstonLogger = WinstonModule.createLogger({
  format: winston.format.combine(
    apeendTimestamp({ tz: 'Asia/Seoul' }),
    winston.format.json(),
    NODE_ENV !== 'production'
      ? winston.format.colorize({ all: true })
      : winston.format.uncolorize(),
    winston.format.printf((info) => {
      const stack =
        info.stack || info.trace ? `\n${info.stack || info.trace}` : '';
      return `${info.timestamp} - ${info.level} [${process.pid}] [${info.context || APP_NAME}] : ${info.message}${stack}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      level: NODE_ENV === 'production' ? 'info' : 'silly',
      format:
        NODE_ENV === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike(APP_NAME, {
                prettyPrint: true,
              }),
            ),
      handleExceptions: true,
      handleRejections: true,
    }),
    new winstonDaily(dailyOptions),
  ],
});
