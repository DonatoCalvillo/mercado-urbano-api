import { Logger } from '@nestjs/common';

const STRING_LENGTH = 70;

export enum ValidLogTypes {
  log = 'log',
  warning = 'warning',
  error = 'error',
}

export const logStandar = (
  sentence: string = '',
  character: string = '=',
  type: ValidLogTypes = ValidLogTypes.log,
) => {
  let final_log: string = '';

  const sentence_length: number = sentence.length + 2;

  const right_space: number = Math.ceil((STRING_LENGTH - sentence_length) / 2);

  const left_space = Math.floor((STRING_LENGTH - sentence_length) / 2);

  //   console.log(right_space, ' ', left_space, ' ', sentence_length);

  for (var i = 0; i < right_space; i++) {
    final_log += character;
  }

  final_log += sentence ? ` ${sentence} ` : `${character}${character}`;

  for (let i = 0; i < left_space; i++) {
    final_log += character;
  }

  switch (type) {
    case ValidLogTypes.log:
      Logger.log(final_log);
      break;
    case ValidLogTypes.warning:
      Logger.warn(final_log);
      break;
    case ValidLogTypes.error:
      Logger.error(final_log);
      break;
    default:
      break;
  }
};
