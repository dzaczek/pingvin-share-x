import { getApiErrorMessage } from "./error.util";

describe("getApiErrorMessage", () => {
  it("should return data.message if it is a non-empty string", () => {
    const error = {
      response: {
        data: {
          message: "This is a message",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("This is a message");
  });

  it("should not return data.message if it is an empty string", () => {
    const error = {
      response: {
        data: {
          message: "   ",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2)
    );
  });

  it("should return joined data.message if it is an array of strings", () => {
    const error = {
      response: {
        data: {
          message: ["Error 1", "Error 2"],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("Error 1\nError 2");
  });

  it("should filter out empty strings in data.message array", () => {
    const error = {
      response: {
        data: {
          message: ["Error 1", "", null, "Error 2"],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("Error 1\nError 2");
  });

  it("should not return joined data.message if array results in empty string", () => {
    const error = {
      response: {
        data: {
          message: ["   ", ""],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2)
    );
  });

  it("should return data.error if it is a non-empty string", () => {
    const error = {
      response: {
        data: {
          error: "This is an error field",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("This is an error field");
  });

  it("should not return data.error if it is an empty string", () => {
    const error = {
      response: {
        data: {
          error: "   ",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2)
    );
  });

  it("should return error.message if it is a non-empty string", () => {
    const error = {
      message: "This is a generic error message",
    };
    expect(getApiErrorMessage(error)).toBe("This is a generic error message");
  });

  it("should not return error.message if it is an empty string", () => {
    const error = {
      message: "   ",
    };
    expect(getApiErrorMessage(error)).toBeUndefined();
  });

  it("should fallback to stringified data if no string fields are found", () => {
    const error = {
      response: {
        data: {
          someField: "some value",
          anotherField: 123,
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2)
    );
  });

  it("should ignore stringification errors and return undefined", () => {
    // create a circular reference to trigger JSON.stringify error
    const data: any = { a: 1 };
    data.circular = data;
    const error = {
      response: {
        data,
      },
    };
    expect(getApiErrorMessage(error)).toBeUndefined();
  });

  it("should return undefined if error object is completely empty", () => {
    expect(getApiErrorMessage({})).toBeUndefined();
  });

  it("should return undefined if error is null or undefined", () => {
    expect(getApiErrorMessage(null)).toBeUndefined();
    expect(getApiErrorMessage(undefined)).toBeUndefined();
  });
});
