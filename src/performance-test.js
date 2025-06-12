// A simple performance test script to measure the impact of memoization

import { findClassByName, findWeaponById, findUpgradeById } from './gameData.js';

// Performance test for findClassByName
function testFindClassByName() {
  console.log('Testing findClassByName performance with memoization...');

  const classNames = ['Light', 'Medium', 'Heavy', 'Assault', 'Light', 'Medium', 'Heavy', 'Assault'];
  const iterations = 10000;

  console.time('findClassByName');
  for (let i = 0; i < iterations; i++) {
    for (const name of classNames) {
      findClassByName(name);
    }
  }
  console.timeEnd('findClassByName');
}

// Performance test for findWeaponById
function testFindWeaponById() {
  console.log('Testing findWeaponById performance with memoization...');

  const weaponIds = ['w1', 'w2', 'w3', 'w4', 'w1', 'w2', 'w3', 'w4'];
  const iterations = 10000;

  console.time('findWeaponById');
  for (let i = 0; i < iterations; i++) {
    for (const id of weaponIds) {
      findWeaponById(id);
    }
  }
  console.timeEnd('findWeaponById');
}

// Run the tests
testFindClassByName();
testFindWeaponById();
