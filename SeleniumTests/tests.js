const webdriver = require('selenium-webdriver');
const expect = require("chai").expect;

class SquarePosition {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
  }

  get x() {
    return this.positionX;
  }

  get y() {
    return this.positionY;
  }
}

class GamePage {
  constructor(driver) {
    this.driver = driver;
  }

  get Status() {
    return webdriver.By.css('.game-info > div');
  }

  Square(posiotion) {
    return webdriver.By.css(`.board-row:nth-child(${posiotion.y}) .square:nth-child(${posiotion.x})`);
  }

  get GoToStart() {
    return webdriver.By.xpath('//button[text()="Go to game start"]');
  }

  GoToMove(move) {
    return webdriver.By.xpath(`//button[contains(text(), "Go to move #${move}")]`);
  }

  square(posiotion) {
    return this.driver.findElement(this.Square(posiotion));
  }

  clickSquare(posiotion) {
    return this.square(posiotion).click();
  }

  async clickSquares(positions) {
    positions.forEach(async (posiotion) =>
      await this.clickSquare(posiotion)
    );
  }

  getSquareState(posiotion) {
    return this.square(posiotion).getText();
  }

  async getFieldState() {
    let state = [];

    for (let posY = 1; posY <= 3; posY++) {
      state.push([]);
      for (let posX = 1; posX <= 3; posX++) {
        state[posY - 1].push(await this.getSquareState(new SquarePosition(posX, posY)));
      }
    }

    return state;
  }

  getStatus() {
    return this.driver.findElement(this.Status).getText();
  }

  clickGotoStart() {
    return this.driver.findElement(this.GoToStart).click();
  }

  clickGoToMove(move) {
    return this.driver.findElement(this.GoToMove(move)).click();
  }
}

describe('Tic-tac-toe', function () {
  const NONE = '';
  const X = 'X';
  const O = 'O';

  const _NEXT_PLAYER = 'Next: ';
  const NEXT_PLAYER_X = _NEXT_PLAYER + X;
  const NEXT_PLAYER_O = _NEXT_PLAYER + O;

  let driver;
  let page;

  before(function () {
    driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
  });

  beforeEach(async function () {
    await driver.get('http://localhost:3000/');
    page = new GamePage(driver);
  });


  it('Next player', async function () {
    expect(await page.getStatus()).to.equal(NEXT_PLAYER_X);

    await page.clickSquare(new SquarePosition(1, 1));
    expect(await page.getStatus()).to.equal(NEXT_PLAYER_O);

    await page.clickSquare(new SquarePosition(2, 2));
    expect(await page.getStatus()).to.equal(NEXT_PLAYER_X);

    await page.clickSquare(new SquarePosition(2, 2));
    expect(await page.getStatus()).to.equal(NEXT_PLAYER_X);

    await page.clickSquare(new SquarePosition(3, 3));
    expect(await page.getStatus()).to.equal(NEXT_PLAYER_O);
  });

  it('X player wins', async function () {
    await page.clickSquares([
      new SquarePosition(1, 1), new SquarePosition(2, 1), new SquarePosition(2, 2),
      new SquarePosition(3, 1), new SquarePosition(3, 3)]
    );

    expect(await page.getStatus()).to.equal('Winner: ' + X);
  });

  it('O player wins', async function () {
    await page.clickSquares([
      new SquarePosition(3, 3), new SquarePosition(2, 1), new SquarePosition(2, 2),
      new SquarePosition(1, 1), new SquarePosition(2, 3), new SquarePosition(3, 1)
    ]);

    expect(await page.getStatus()).to.equal('Winner: ' + O);
  });

  it('Draw', async function () {
    await page.clickSquares([
      new SquarePosition(1, 1), new SquarePosition(2, 1), new SquarePosition(3, 2),
      new SquarePosition(2, 2), new SquarePosition(2, 3), new SquarePosition(1, 2),
      new SquarePosition(1, 3), new SquarePosition(3, 3), new SquarePosition(3, 1)
    ]);

    expect(await page.getStatus()).to.equal('Draw');
  });

  it('Go to game start', async function () {
    await page.clickSquares([
      new SquarePosition(1, 1), new SquarePosition(3, 3), new SquarePosition(3, 2)
    ]);

    expect(await page.getStatus()).to.equal(NEXT_PLAYER_O);
    expect(await page.getFieldState()).to.deep.equal([
      [X, NONE, NONE],
      [NONE, NONE, X],
      [NONE, NONE, O]
    ]);

    await page.clickGotoStart();

    expect(await page.getStatus()).to.equal(NEXT_PLAYER_X);
    expect(await page.getFieldState()).to.deep.equal([
      [NONE, NONE, NONE],
      [NONE, NONE, NONE],
      [NONE, NONE, NONE]
    ]);
  });

  it('Go to move', async function () {
    await page.clickSquares([
      new SquarePosition(1, 1), new SquarePosition(2, 1), new SquarePosition(3, 1),
      new SquarePosition(1, 3), new SquarePosition(2, 3), new SquarePosition(3, 3)
    ]);

    expect(await page.getStatus()).to.equal(NEXT_PLAYER_X);
    expect(await page.getFieldState()).to.deep.equal([
      [X, O, X],
      [NONE, NONE, NONE],
      [O, X, O]
    ]);

    await page.clickGoToMove(3);

    expect(await page.getStatus()).to.equal(NEXT_PLAYER_O);
    expect(await page.getFieldState()).to.deep.equal([
      [X, O, X],
      [NONE, NONE, NONE],
      [NONE, NONE, NONE]
    ]);
  });

  after(async function () {
    await driver.quit();
  });
});
