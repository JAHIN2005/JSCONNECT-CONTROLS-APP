
export enum RobotCommand {
  Forward = 'forward',
  Backward = 'backward',
  Left = 'left',
  Right = 'right',
  Stop = 'stop',
  Horn = 'horn',
}

export enum RobotMode {
  Free = 'free',
  LineFollower = 'line',
  ObstacleAvoidance = 'obstacle',
}

export enum ConnectionStatus {
  Unknown = 'unknown',
  Success = 'success',
  Failed = 'failed',
  Testing = 'testing',
}
