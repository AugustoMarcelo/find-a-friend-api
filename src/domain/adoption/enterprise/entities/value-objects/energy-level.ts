export enum EnergyLevelValue {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class EnergyLevel {
  private readonly value: EnergyLevelValue

  private constructor(value: EnergyLevelValue) {
    this.value = value
  }

  static create(value: string): EnergyLevel {
    const normalized = value.toUpperCase()
    if (
      !Object.values(EnergyLevelValue).includes(normalized as EnergyLevelValue)
    ) {
      throw new Error(`Invalid energy level: ${value}`)
    }
    return new EnergyLevel(normalized as EnergyLevelValue)
  }

  static low(): EnergyLevel {
    return new EnergyLevel(EnergyLevelValue.LOW)
  }

  static medium(): EnergyLevel {
    return new EnergyLevel(EnergyLevelValue.MEDIUM)
  }

  static high(): EnergyLevel {
    return new EnergyLevel(EnergyLevelValue.HIGH)
  }

  getValue(): EnergyLevelValue {
    return this.value
  }

  equals(level: EnergyLevel): boolean {
    return this.value === level.getValue()
  }
}
