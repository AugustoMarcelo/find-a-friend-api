export class Whatsapp {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): Whatsapp {
    const normalized = value.replace(/\D/g, '')
    if (normalized.length < 10 || normalized.length > 11) {
      throw new Error('Invalid WhatsApp number')
    }
    return new Whatsapp(normalized)
  }

  getValue(): string {
    return this.value
  }

  getFormatted(): string {
    const ddd = this.value.slice(0, 2)
    const firstPart = this.value.slice(2, -4)
    const lastPart = this.value.slice(-4)
    return `(${ddd}) ${firstPart}-${lastPart}`
  }

  equals(whatsapp: Whatsapp): boolean {
    return this.value === whatsapp.getValue()
  }
}
