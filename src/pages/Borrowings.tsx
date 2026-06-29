import DebtPage from '../components/DebtPage'

export default function Borrowings() {
  return (
    <DebtPage
      kind="borrowings"
      copy={{
        title: 'Borrowings',
        subtitle: 'Money you have borrowed and still owe to others.',
        personLabel: 'Lender',
        outstandingLabel: 'You owe',
        addLabel: 'Add borrowing',
        emptyMessage: 'Track money you owe so nothing slips through the cracks.',
        tone: 'warn',
      }}
    />
  )
}
