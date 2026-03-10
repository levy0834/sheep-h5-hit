import { RESCUE_CARD_LIBRARY } from "../config/meta-config";
import type { MetaConfig, RescueCard, RescueCardId } from "../types";
import { SeededRng } from "../utils/seeded-rng";

const CALM_DECK: RescueCardId[] = ["rewind-step", "wild-pair", "overflow-shield"];
const CHAOS_DECK: RescueCardId[] = [
  "overflow-shield",
  "wild-pair",
  "rewind-step",
  "overflow-shield",
];

export class RescueDeck {
  private charge = 0;
  private heldCard: RescueCard | null = null;

  constructor(private readonly config: MetaConfig["rescue"]) {}

  public reset(): void {
    this.charge = 0;
    this.heldCard = null;
  }

  public getCharge(): number {
    return this.charge;
  }

  public getHeldCard(): RescueCard | null {
    return this.heldCard;
  }

  public gainCharge(amount: number): number {
    if (amount <= 0) {
      return this.charge;
    }
    this.charge = Math.min(this.config.maxCharge, this.charge + amount);
    return this.charge;
  }

  public tryGrantFromNearFail(
    freeSlots: number,
    chaosLevel: number,
    rng: SeededRng,
  ): RescueCard | null {
    if (this.heldCard || freeSlots > this.config.autoGrantAtFreeSlots || this.charge < 1) {
      return null;
    }

    this.charge -= 1;
    this.heldCard = this.drawCard(chaosLevel, rng);
    return this.heldCard;
  }

  public grantBonusCard(chaosLevel: number, rng: SeededRng): RescueCard | null {
    if (this.heldCard) {
      return null;
    }
    this.heldCard = this.drawCard(chaosLevel, rng);
    return this.heldCard;
  }

  public consumeHeldCard(): RescueCard | null {
    const card = this.heldCard;
    this.heldCard = null;
    return card;
  }

  private drawCard(chaosLevel: number, rng: SeededRng): RescueCard {
    const deck = chaosLevel >= 2 ? CHAOS_DECK : CALM_DECK;
    const cardId = rng.pick(deck);
    return RESCUE_CARD_LIBRARY[cardId];
  }
}
