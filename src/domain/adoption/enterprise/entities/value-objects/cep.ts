export class Cep {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): Cep {
    const normalized = value.replace(/\D/g, '')
    if (normalized.length !== 8) {
      throw new Error('Invalid CEP format')
    }
    return new Cep(normalized)
  }

  getValue(): string {
    return this.value
  }

  getFormatted(): string {
    return `${this.value.slice(0, 5)}-${this.value.slice(5)}`
  }

  equals(cep: Cep): boolean {
    return this.value === cep.getValue()
  }
}
