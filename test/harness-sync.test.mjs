import test from 'node:test';
import assert from 'node:assert';
import { CONSUMER_DOC_SKILL_NAMES } from '../bin/lib/harness-sync.mjs';

test('consumer docs skill set includes docs-hub and spec grill chain', () => {
  assert.ok(CONSUMER_DOC_SKILL_NAMES.has('docs-hub'));
  assert.ok(CONSUMER_DOC_SKILL_NAMES.has('spec'));
  assert.ok(CONSUMER_DOC_SKILL_NAMES.has('grill-bqa'));
  assert.ok(CONSUMER_DOC_SKILL_NAMES.has('grill-dev'));
  assert.ok(CONSUMER_DOC_SKILL_NAMES.has('api-spec'));
});
