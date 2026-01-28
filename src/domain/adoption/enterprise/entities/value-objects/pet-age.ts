export enum PetAgeValue {
  PUPPY = 'PUPPY',
  ADULT = 'ADULT',
  SENIOR = 'SENIOR',
}

export class PetAge {
  private readonly value: PetAgeValue

  private constructor(value: PetAgeValue) {
    this.value = value
  }

  static create(value: string): PetAge {
    const normalized = value.toUpperCase()
    if (!Object.values(PetAgeValue).includes(normalized as PetAgeValue)) {
      throw new Error(`Invalid pet age: ${value}`)
    }
    return new PetAge(normalized as PetAgeValue)
  }

  static puppy(): PetAge {
    return new PetAge(PetAgeValue.PUPPY)
  }

  static adult(): PetAge {
    return new PetAge(PetAgeValue.ADULT)
  }

  static senior(): PetAge {
    return new PetAge(PetAgeValue.SENIOR)
  }

  getValue(): PetAgeValue {
    return this.value
  }

  equals(age: PetAge): boolean {
    return this.value === age.getValue()
  }
}
