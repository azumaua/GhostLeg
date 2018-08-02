import { Component } from '@angular/core';

// あみだくじを引く人
const LOTTERY_SELECTORS = [
  'A',
  'B',
  'C',
  'D'
];

// 当たり数
const WINNING_COUNT = 2;

// あみだの高さ
const LOTTERY_HEIGHT = 8;

// 接続数
const LINK_COUNT = LOTTERY_SELECTORS.length * 3;

// あみだの段
class LadderStep {
  pos = 0;
}

// くじ
class Lottery {
  id = 0;
  selector = '';
  winning = false;
  steps: LadderStep[] = [];
}

// くじの接続
class LotteryLink {
  left: Lottery = null;
  right: Lottery = null;
  pos = 0;
}

// ランダムな要素の取得
const getRandomElement = <T>(arr: Array<T>): T =>
  arr[Math.floor(Math.random() * arr.length)];

// ユニークな要素を取得し続けるファクトリー関数
const randomUniqueElementFactory = <T>(arr: Array<T>) => {
  const selected = new Set<T>();
  return () => {
    const rest = arr.filter(s => !selected.has(s));
    const next = getRandomElement(rest);
    selected.add(next);
    return next;
  };
};

// 当たりを生成するファクトリー関数
const winnerFactory = () => {

  // 指定された数までユニークな当選者を集める
  const winners = new Set<string>();
  const nextSelector = randomUniqueElementFactory(LOTTERY_SELECTORS);
  for (let i = 0; i < WINNING_COUNT; i++) {
    winners.add(nextSelector());
  }

  return selector => winners.has(selector);
};

// くじ作成
const createLots = () => {

  // ファクトリー準備
  const nextSelector = randomUniqueElementFactory(LOTTERY_SELECTORS);
  const isWinner = winnerFactory();

  // くじを引く人の分だけくじ作成
  const lots: Array<Lottery> = [];
  for (let i = 0; i < LOTTERY_SELECTORS.length; i++) {
    const lot = new Lottery();
    lots.push(lot);
    lot.id = i;
    lot.selector = nextSelector();
    lot.winning = isWinner(lot.selector);

    // 段の作成
    const steps = Array(LOTTERY_HEIGHT).fill(0).map((_, idx) => {
      const step = new LadderStep();
      step.pos = idx;
      return step;
    });
    lot.steps = steps;

  }
  return lots;
};

// 理論上可能なすべての接続を返す
const createAllLinks = (lots: Array<Lottery>) => {

  const links: Array<LotteryLink> = [];

  for (let pos = 0; pos < LOTTERY_HEIGHT; pos++) {
    for (let id = 0; id < lots.length; id++) {

      const left = lots.find(l => l.id === id);
      const right = lots.find(l => l.id === (id + 1));

      if (right) {
        const link = new LotteryLink();
        links.push(link);
        link.left = left;
        link.right = right;
        link.pos = pos;
      }
    }

  }

  return links;
};

// 接続が隣り合っているかを判定
const neighborLink =
  (x: LotteryLink, y: LotteryLink) =>
    x.pos === y.pos &&
    ((y.right.id - x.left.id) === 0 || (x.right.id - y.left.id) === 0);

// 設置可能なすべての接続を返す
const getAvailableLinks = (lots: Array<Lottery>, links: Array<LotteryLink>) => {

  const allLinks = createAllLinks(lots);
  const availables = allLinks.filter(x => !links.some(y => neighborLink(x, y)));
  return availables;

};

// ユニークな接続の作成
const createUniqueLinks = (lots: Array<Lottery>) => {
  const links: Array<LotteryLink> = [];
  for (let i = 0; i < LINK_COUNT; i++) {
    const availables = getAvailableLinks(lots, links);
    const link = getRandomElement(availables);
    links.push(link);
  }
  return links;

};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// メインコンポーネント
export class AppComponent {
  lots: Lottery[] = [];
  links: LotteryLink[] = [];

  // コンストラクタ
  constructor() {
    this.lots = createLots();
    this.links = createUniqueLinks(this.lots);
  }

  // マウスが入ったとき
  onEnter() {
  }

  // マウスが離れたとき
  onLeave() {
  }

  // 段が接続を持っているかどうか 
  hasLink(lot: Lottery, step: LadderStep) {
    return this.links.some(l => l.left.id === lot.id && step.pos === l.pos);
  }

}
