export enum PetSizeValue {
  TINY = 'TINY',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export class PetSize {
  private readonly value: PetSizeValue

  private constructor(value: PetSizeValue) {
    this.value = value
  }

  static create(value: string): PetSize {
    const normalized = value.toUpperCase()
    if (!Object.values(PetSizeValue).includes(normalized as PetSizeValue)) {
      throw new Error(`Invalid pet size: ${value}`)
    }
    return new PetSize(normalized as PetSizeValue)
  }

  static tiny(): PetSize {
    return new PetSize(PetSizeValue.TINY)
  }

  static small(): PetSize {
    return new PetSize(PetSizeValue.SMALL)
  }

  static medium(): PetSize {
    return new PetSize(PetSizeValue.MEDIUM)
  }

  static large(): PetSize {
    return new PetSize(PetSizeValue.LARGE)
  }

  getValue(): PetSizeValue {
    return this.value
  }

  equals(size: PetSize): boolean {
    return this.value === size.getValue()
  }
}
