export const Toast = {
  async show(data: {
    text: string;
    duration?: 'short' | 'long';
    position?: 'bottom' | 'center' | 'top';
  }): Promise<void> {},
};
