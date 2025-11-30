describe('basic e2e', () => {
  it('bootstraps app', async () => {
    const mod = await import('../src/index');
    expect(mod.setupOk).toBe(true);
  });
});
