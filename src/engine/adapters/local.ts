import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

const FALLBACK_SENTENCES: string[] = [
  "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
  "千里之行，始于足下。",
  "Stay hungry, stay foolish.",
  "世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。",
  "所谓无底深渊，下去，也是前程万里。",
  "人生如逆旅，我亦是行人。",
  "The only way to do great work is to love what you do.",
  "已识乾坤大，犹怜草木青。",
  "脚踏实地，仰望星空。",
  "Less is more.",
  "不积跬步，无以至千里；不积小流，无以成江海。",
  "博观而约取，厚积而薄发。",
  "路漫漫其修远兮，吾将上下而求索。",
  "山重水复疑无路，柳暗花明又一村。",
  "长风破浪会有时，直挂云帆济沧海。",
  "回首向来萧瑟处，归去，也无风雨也无晴。",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "知之为知之，不知为不知，是知也。",
  "学而不思则罔，思而不学则殆。",
  "All we have to decide is what to do with the time that is given us.",
  "道阻且长，行则将至。",
  "Darkness cannot drive out darkness; only light can do that.",
  "草木有本心，何求美人折。",
  "行到水穷处，坐看云起时。",
  "Be yourself; everyone else is already taken.",
  "问渠那得清如许？为有源头活水来。",
  "不畏浮云遮望眼，自缘身在最高层。",
  "It is not in the stars to hold our destiny but in ourselves.",
  "纸上得来终觉浅，绝知此事要躬行。",
  "静以修身，俭以养德。",
]

export class LocalAdapter extends BaseAdapter {
  readonly name = "local"
  readonly label = "本地语料"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const text = FALLBACK_SENTENCES[Math.floor(Math.random() * FALLBACK_SENTENCES.length)]
    return {
      id: this.generateId(),
      content: text,
      source: this.name,
      fetchedAt: Date.now(),
    }
  }
}
