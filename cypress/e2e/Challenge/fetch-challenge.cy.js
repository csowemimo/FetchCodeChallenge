import { weighBars } from '../../support/challengeHelpers';

describe('Fetch Challenge', () => {
    it('Finds fake bar', () => {
      cy.visit('http://sdetchallenge.fetch.com/');
      cy.wait(2000);

      weighBars();
  });
})
  