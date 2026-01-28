export class Email {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format')
    }
    return new Email(value.toLowerCase())
  }

  getValue(): string {
    return this.value
  }

  equals(email: Email): boolean {
    return this.value === email.getValue()
  }
}
