import { Injectable, NotFoundException } from '@nestjs/common';
import { SavingsRepository } from './savings.repository';

@Injectable()
export class SavingsService {
  constructor(private readonly savingsRepository: SavingsRepository) {}

  async getMySavings(userId: string) {
    const account = await this.savingsRepository.findByUserId(userId);
    if (!account) throw new NotFoundException('Rekening tabungan tidak ditemukan');

    const current = Number(account.currentBalance);
    const target = Number(account.targetAmount);
    const remaining = Math.max(target - current, 0);
    const progressPercent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

    return {
      currentBalance: current,
      targetAmount: target,
      remainingAmount: remaining,
      progressPercent,
    };
  }
}
