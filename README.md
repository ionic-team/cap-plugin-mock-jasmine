# Capacitor Plugin Mocks with Jasmine

Mocking a plugin in a unit test can be a challenge. Most mocking libraries mock an object by wrapping a JavaScript proxy around the object. Capacitor plugins, however, are already set up as JavaScript proxies, and you cannot create a proxy of a proxy. To get around this when using Jest as your testing framework, <a href="https://jestjs.io/docs/manual-mocks" _target="blank">manual mocks</a> would typically be used. Angular projects, however, use Jasmine by default and the manual mocking is not available. This project shows how to set up a similar structure within a projet that is using the Jasmine unit testing framework.

## The Manual Mocks (Jest)

For this project, I am using two Capacitor plugins: `@capacitor/storage` and `@capacitor/toast`. With an `@ionic/vue` or `@ionic/react` project, both of which use Jest as the default unit testing framework, I create the following file structure at the root of the project:

```
.
|
+- __mocks__
| |
| +- @capacitor
|   |
|   +- storeage.ts
|   +- toast.ts
...
+- src
```

The code in these files create some simple stubs that I use within the tests. For example:

**storeage.ts**

```TypeScript
export const Storage = {
  async get(data: { key: string }): Promise<{ value: string | undefined }> {
    return { value: undefined };
  },

  async set(data: { key: string; value: string }): Promise<void> {},
  async clear(): Promise<void> {},
};
```

**toast.ts**

```TypeScript
export const Toast = {
  async show(data: {
    text: string;
    duration?: 'short' | 'long';
    position?: 'bottom' | 'center' | 'top';
  }): Promise<void> {},
};
```

As you can see, they do almost nothing, which is exactly what you want stubs to do.

When I want to have fine-grained control in my tests, I can create mocks on the stubs and have complete control over my tests. For example, here is a test for an `@ionic/vue` application that controls the return value for `Storage.get()`:

```TypeScript
  it("gets the first and last name", async () => {
    Storage.get = jest.fn().mockImplementation(
      async (data: { key: string }): Promise<{ value: string }> => {
        return data.key === "firstName"
          ? { value: "Jimmy" }
          : data.key === "lastName"
          ? { value: "Simms" }
          : { value: "unknown" };
      }
    );
    const w = mount(Home);
    await flushPromises();
    expect(w.vm.firstName).toEqual("Jimmy");
    expect(w.vm.lastName).toEqual("Simms");
  });
```

The combination of the Jest manual mocks and the standard Jest mocks provides this level of control.

## The Manual Mocks (Jasmine)

For my Angular project, I would like to write a very similar test:

```TypeScript
  it("gets the first and last name", async () => {
    spyOn(Storage, 'get');
    (Storage.get as any)
      .withArgs({ key: 'firstName' })
      .and.returnValue(Promise.resolve({ value: 'Jimmy' }));
    (Storage.get as any)
      .withArgs({ key: 'lastName' })
      .and.returnValue(Promise.resolve({ value: 'Simms' }));
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    expect(component.firstName).toEqual('Jimmy');
    expect(component.lastName).toEqual('Simms');
  });
```

When I try this, I get odd errors because the `spyOn` is trying to wrap `Storage.get()` in a proxy. However, `Storage` already is a proxy so this doesn't work (we would have the same issue in our Jest based test above without the manual mock in place).

Ideally, I would create a manual mock to stub `@capacitor/storage` just like I did for my `@ionic/vue` project, but unlike Jest, Jasmine does not have this capability. TypeScript allows me to easily fake it, though.

First, set up a `__mocks__` directory _exactly_ the same as was done with the Jest based projects:

```
.
|
+- __mocks__
| |
| +- @capacitor
|   |
|   +- storeage.ts
|   +- toast.ts
...
+- src
```

**storeage.ts**

```TypeScript
export const Storage = {
  async get(data: { key: string }): Promise<{ value: string | undefined }> {
    return { value: undefined };
  },

  async set(data: { key: string; value: string }): Promise<void> {},
  async clear(): Promise<void> {},
};
```

**toast.ts**

```TypeScript
export const Toast = {
  async show(data: {
    text: string;
    duration?: 'short' | 'long';
    position?: 'bottom' | 'center' | 'top';
  }): Promise<void> {},
};
```

With Jest these will automatically be picked up by the tests. With Jasmine this will not happen automatically, but we can use TypeScript's file mapping features in order to do the same thing.

Typically, within the `tsconfig.json` file, I do a little TypeScript path mapping in order to avoid the use of relative paths. For example, I typically have a mapping such as the following:

```JSON
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"]
    },
```

Extend this in the `tsconfig.spec.json` file as such:

```JSON
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"],
      "@test/*": ["test/*"],
      "@capacitor/*": ["__mocks__/@capacitor/*"]
    }
```

Now, when your code is being compiled for testing, and the compiler comes across code such as `import { Stroage } from @capacitor/storage`, TypeScript will look in `__mocks__/@capacitor` for the code rather than `node_modules`.

There are a couple of things to keep in mind:

- Replacing the `paths` object in `tsconfig.spec.json` replaces the whole object, so you need to copy any paths that are set up in `tsconfig.json` so everything will continue to work properly.
- When running tests, TypeScript will no longer look in `node_modules` for any `@capacitor` file you are importing, so you need to create stubs for everything you are using.

## Conclusion

With a little bit of TypeScript path mapping, we can facilitate the same kind of _manual mocking_ that Jest has within our Jasmine based tests, making it very easy to mock the `@capacitor` plugins that are used within our code.

Happy Testing, Everybody!! 🤓
