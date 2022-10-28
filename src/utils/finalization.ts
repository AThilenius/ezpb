const NativeFinalizationRegistry =
  (typeof window !== 'undefined' && window.FinalizationRegistry) ||
  (typeof global !== 'undefined' && global.FinalizationRegistry) ||
  undefined;

class DummyFinalizationRegistry<T> implements FinalizationRegistry<T> {
  public [Symbol.toStringTag]: 'FinalizationRegistry' = 'FinalizationRegistry';
  public register() {}
  public unregister() {}
}

/// Provides a working FinalizationRegistry on platforms that provide one, or
/// a dummy implementation that does nothing. Only to be used where finalization
/// is a nice performance optimization but not required.
export const OptionalFinalizationRegistry: FinalizationRegistryConstructor =
  NativeFinalizationRegistry || DummyFinalizationRegistry;
