import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/validations/contact";

const valid = {
  name: "John Ross",
  email: "hi@example.com",
  message: "This is a message longer than ten characters.",
};

describe("contactSchema", () => {
  it("accepts a valid payload", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(contactSchema.safeParse({ ...valid, name: "J" }).success).toBe(
      false
    );
  });

  it("rejects an invalid email", () => {
    expect(
      contactSchema.safeParse({ ...valid, email: "not-an-email" }).success
    ).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(
      contactSchema.safeParse({ ...valid, message: "short" }).success
    ).toBe(false);
  });

  it("rejects a message over 2000 characters", () => {
    expect(
      contactSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success
    ).toBe(false);
  });

  // Honeypot field — see the `company` comment in contact.ts. The schema only bounds its shape;
  // the actual bot-vs-human decision is made by app/api/contact/route.ts checking truthiness.
  it("accepts a payload with no company field at all", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an empty company field", () => {
    expect(contactSchema.safeParse({ ...valid, company: "" }).success).toBe(
      true
    );
  });

  it("accepts a company field up to 200 characters", () => {
    expect(
      contactSchema.safeParse({ ...valid, company: "a".repeat(200) }).success
    ).toBe(true);
  });

  it("rejects a company field over 200 characters", () => {
    expect(
      contactSchema.safeParse({ ...valid, company: "a".repeat(201) }).success
    ).toBe(false);
  });
});
