import { describe, it, expect } from "vitest";
import { demoEchoSchema } from "@/lib/validations/demo";

describe("demoEchoSchema", () => {
  it("accepts a normal string", () => {
    expect(demoEchoSchema.safeParse({ text: "hello" }).success).toBe(true);
  });

  it("accepts exactly 200 characters", () => {
    expect(demoEchoSchema.safeParse({ text: "a".repeat(200) }).success).toBe(
      true
    );
  });

  it("rejects an empty string", () => {
    expect(demoEchoSchema.safeParse({ text: "" }).success).toBe(false);
  });

  it("rejects 201 characters", () => {
    expect(demoEchoSchema.safeParse({ text: "a".repeat(201) }).success).toBe(
      false
    );
  });

  it("rejects a missing text field", () => {
    expect(demoEchoSchema.safeParse({}).success).toBe(false);
  });
});
