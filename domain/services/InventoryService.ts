
import { StoneItem, SalesDelegation, OfferLink } from '../../types';

/**
 * InventoryService
 * 
 * Responsabilidade: Garantir a integridade matemática do estoque.
 * Princípio: "Source of Truth" para cálculos de disponibilidade.
 * 
 * Regras de Negócio:
 * 1. O estoque físico total é imutável via transações (só muda via ajuste de lote).
 * 2. Vendas confirmadas ('sold') abatem da disponibilidade global.
 * 3. Reservas APROVADAS ('reserved') abatem da disponibilidade global imediatamente (Hard Lock).
 * 4. Reservas incluem:
 *    a. Ofertas diretas da Indústria em status 'active' ou 'reservation_pending'.
 *    b. O saldo de delegações (Cota do vendedor - O que ele já vendeu ou está reservado hard).
 */
export class InventoryService {
  
  public static reconcile(
    baseStones: StoneItem[], 
    delegations: SalesDelegation[], 
    offers: OfferLink[]
  ): StoneItem[] {
    return (baseStones || []).map(stone => {
      // 1. Cálculo de "Saídas Confirmadas" (Vendas + Reservas Aprovadas)
      const totalSoldOrLocked = this.calculateTotalSoldOrLocked(stone.id, offers);

      // 2. Cálculo de Reservas Temporárias (Estoque Travado em Negociação/Delegação)
      const totalSoftReserved = this.calculateTotalSoftReserved(stone.id, delegations, offers);

      // 3. Disponibilidade Final (O que sobra na fábrica para novas ações)
      // Math.max(0, ...) previne números negativos em caso de inconsistência de dados
      const availableQuantity = Math.max(0, stone.quantity.total - totalSoftReserved - totalSoldOrLocked);

      return {
        ...stone,
        quantity: {
          ...stone.quantity,
          available: availableQuantity,
          reserved: totalSoftReserved,
          sold: totalSoldOrLocked // Visualmente mostraremos Reservado+Vendido como "Ocupado"
        }
      };
    });
  }

  private static calculateTotalSoldOrLocked(stoneId: string, offers: OfferLink[]): number {
    return offers
      .filter(o => o.stoneId === stoneId && (o.status === 'sold' || o.status === 'reserved'))
      .reduce((sum, o) => sum + (o.quantityOffered || 0), 0);
  }

  private static calculateTotalSoftReserved(
    stoneId: string, 
    delegations: SalesDelegation[], 
    offers: OfferLink[]
  ): number {
    
    // A. Reservas Diretas da Indústria (Sem intermediário) - Active or Pending
    const activeDirectQuantity = offers
      .filter(o => 
        o.stoneId === stoneId && 
        !o.delegationId && 
        (o.status === 'active' || o.status === 'reservation_pending')
      )
      .reduce((sum, o) => sum + (o.quantityOffered || 0), 0);

    // B. Reservas via Parceiros (Delegações)
    // A delegação "segura" o estoque para o vendedor.
    // Se o vendedor vende ou tem RESERVA APROVADA, a delegação é consumida (sai da cota livre).
    // O que resta da cota original é o que está "Reservado" na mão do vendedor (seja livre ou em oferta ativa).
    const delegatedReservedQuantity = delegations
      .filter(d => d.stoneId === stoneId)
      .reduce((sum, d) => {
         // Quanto dessa delegação já virou venda confirmada ou reserva aprovada?
         const consumedByDelegation = offers
            .filter(o => 
                o.delegationId === d.id && 
                (o.status === 'sold' || o.status === 'reserved')
            )
            .reduce((acc, o) => acc + o.quantityOffered, 0);
         
         // O que resta da cota original é o que está "Reservado" na mão do vendedor.
         const remainingBalance = Math.max(0, d.delegatedQuantity - consumedByDelegation);
         
         return sum + remainingBalance;
      }, 0);

    return activeDirectQuantity + delegatedReservedQuantity;
  }
}
