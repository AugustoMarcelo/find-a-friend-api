export enum EnvironmentValue {
  SMALL_SPACE = 'SMALL_SPACE',
  MEDIUM_SPACE = 'MEDIUM_SPACE',
  LARGE_SPACE = 'LARGE_SPACE',
}

export class Environment {
  private readonly value: EnvironmentValue

  private constructor(value: EnvironmentValue) {
    this.value = value
  }

  static create(value: string): Environment {
    const normalized = value.toUpperCase()
    if (
      !Object.values(EnvironmentValue).includes(normalized as EnvironmentValue)
    ) {
      throw new Error(`Invalid environment: ${value}`)
    }
    return new Environment(normalized as EnvironmentValue)
  }

  static smallSpace(): Environment {
    return new Environment(EnvironmentValue.SMALL_SPACE)
  }

  static mediumSpace(): Environment {
    return new Environment(EnvironmentValue.MEDIUM_SPACE)
  }

  static largeSpace(): Environment {
    return new Environment(EnvironmentValue.LARGE_SPACE)
  }

  getValue(): EnvironmentValue {
    return this.value
  }

  equals(environment: Environment): boolean {
    return this.value === environment.getValue()
  }
}
