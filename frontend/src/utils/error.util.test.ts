import { getApiErrorMessage } from "./error.util";

// The helper digs through an axios error for something worth showing a user,
// and the order it looks in is the whole point: the api's own message first,
// then its error field, then the exception, and only then the raw body. Each
// step also has to skip a value that is technically there but says nothing,
// which is why the whitespace cases below are here rather than being noise.

describe("getApiErrorMessage", () => {
  it("takes the api's message field when there is one", () => {
    const error = {
      response: {
        data: {
          message: "This is a message",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("This is a message");
  });

  it("falls past a message that is only whitespace", () => {
    const error = {
      response: {
        data: {
          message: "   ",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2),
    );
  });

  it("joins a list of messages onto separate lines", () => {
    const error = {
      response: {
        data: {
          message: ["Error 1", "Error 2"],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("Error 1\nError 2");
  });

  it("drops the empty entries out of that list", () => {
    const error = {
      response: {
        data: {
          message: ["Error 1", "", null, "Error 2"],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("Error 1\nError 2");
  });

  it("falls past a list with nothing left in it once the empties are gone", () => {
    const error = {
      response: {
        data: {
          message: ["   ", ""],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2),
    );
  });

  it("falls back to the error field when there is no message", () => {
    const error = {
      response: {
        data: {
          error: "This is an error field",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe("This is an error field");
  });

  it("falls past an error field that is only whitespace", () => {
    const error = {
      response: {
        data: {
          error: "   ",
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2),
    );
  });

  it("uses the exception's own message when the response carries nothing", () => {
    const error = {
      message: "This is a generic error message",
    };
    expect(getApiErrorMessage(error)).toBe("This is a generic error message");
  });

  it("falls past an exception message that is only whitespace", () => {
    const error = {
      message: "   ",
    };
    expect(getApiErrorMessage(error)).toBeUndefined();
  });

  it("prints the response body when it holds no field worth showing", () => {
    const error = {
      response: {
        data: {
          someField: "some value",
          anotherField: 123,
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe(
      JSON.stringify(error.response.data, null, 2),
    );
  });

  it("gives up rather than throwing when the body cannot be stringified", () => {
    const data: any = { a: 1 };
    data.circular = data;
    const error = {
      response: {
        data,
      },
    };
    expect(getApiErrorMessage(error)).toBeUndefined();
  });

  it("has nothing to say about an empty error", () => {
    expect(getApiErrorMessage({})).toBeUndefined();
  });

  it("has nothing to say when there is no error at all", () => {
    expect(getApiErrorMessage(null)).toBeUndefined();
    expect(getApiErrorMessage(undefined)).toBeUndefined();
  });
});
