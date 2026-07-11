# Edit transaction amount currency fix

## Plan

- [ ] Add a small helper that turns stored minor units into the edit-field default string and input step based on the transaction currency.
- [ ] Update `EditTransactionModal` to use the helper instead of hard-coded `0.01` and `.toFixed(2)`.
- [ ] Add unit coverage for currencies with 0 fraction digits and currencies with 2 fraction digits.
- [ ] Run focused unit and lint checks for the touched code.
- [ ] Ask the user to run the relevant Playwright E2E flow, since browser tests stay user-run in this repo.
