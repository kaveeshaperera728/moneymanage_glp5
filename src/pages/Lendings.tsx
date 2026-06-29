import DebtPage from '../components/DebtPage'

export default function Lendings() {
  return (
    <DebtPage
      kind="lendings"
      copy={{
        title: 'Lendings',
        subtitle: 'Money you have lent out and others still owe you.',
        personLabel: 'Borrower',
        outstandingLabel: 'Owed to you',
        addLabel: 'Add lending',
        emptyMessage: 'Keep track of money people owe you and get paid back.',
        tone: 'neutral',
      }}
    />
  )
}
