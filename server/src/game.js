// server/src/game.js
export function calcHitBlow(secret, guess) {
    let hit = 0;
    let blow = 0;
  
    for (let i = 0; i < 4; i++) {
      if (guess[i] === secret[i]) hit++;
      else if (secret.includes(guess[i])) blow++;
    }
  
    return { hit, blow };
  }
  