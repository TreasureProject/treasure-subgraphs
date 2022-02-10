export function getXpPerLevel(level: i32): i32 {
  switch (level) {
    case 1:
    case 2:
      return 10;
    case 3:
    case 4:
      return 20;
    case 5:
      return 40;
    default:
      return 0;
  }
}
