export enum IndependenceLevelValue {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class IndependenceLevel {
  private readonly value: IndependenceLevelValue

  private constructor(value: IndependenceLevelValue) {
    this.value = value
  }

  static create(value: string): IndependenceLevel {
    const normalized = value.toUpperCase()
    if (
      !Object.values(IndependenceLevelValue).includes(
        normalized as IndependenceLevelValue,
      )
    ) {
      throw new Error(`Invalid independence level: ${value}`)
    }
    return new IndependenceLevel(normalized as IndependenceLevelValue)
  }

  static low(): IndependenceLevel {
    return new IndependenceLevel(IndependenceLevelValue.LOW)
  }

  static medium(): IndependenceLevel {
    return new IndependenceLevel(IndependenceLevelValue.MEDIUM)
  }

  static high(): IndependenceLevel {
    return new IndependenceLevel(IndependenceLevelValue.HIGH)
  }

  getValue(): IndependenceLevelValue {
    return this.value
  }

  equals(level: IndependenceLevel): boolean {
    return this.value === level.getValue()
  }
}
