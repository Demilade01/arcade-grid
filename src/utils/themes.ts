export interface Theme {
  name: string;
  backgroundColor: number;
  snakeHeadColor: number;
  snakeBodyColor: number;
  foodColor: number;
  gridColor: number;
  textColor: number;
  accentColor: number;
}

export const themes: Record<string, Theme> = {
  dark: {
    name: 'Dark',
    backgroundColor: 0x1a1a1a,
    snakeHeadColor: 0x00ff00,
    snakeBodyColor: 0x008800,
    foodColor: 0xff0000,
    gridColor: 0x333333,
    textColor: 0xffffff,
    accentColor: 0x4a90e2
  },
  neon: {
    name: 'Neon',
    backgroundColor: 0x0a0a0a,
    snakeHeadColor: 0x00ffff,
    snakeBodyColor: 0x0080ff,
    foodColor: 0xff00ff,
    gridColor: 0x1a1a2e,
    textColor: 0x00ffff,
    accentColor: 0xff00ff
  },
  retro: {
    name: 'Retro',
    backgroundColor: 0x2d1b69,
    snakeHeadColor: 0xffff00,
    snakeBodyColor: 0xffa500,
    foodColor: 0xff4500,
    gridColor: 0x4a4a4a,
    textColor: 0xffff00,
    accentColor: 0xff4500
  }
};
