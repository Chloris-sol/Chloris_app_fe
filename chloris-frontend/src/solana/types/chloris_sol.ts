/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/chloris_sol.json`.
 */
export type ChlorisSol = {
  "address": "3h5ShZh1CPw4nXv5uLuifcBppm5W5hcRHG5ivaoXJdih",
  "metadata": {
    "name": "chlorisSol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim",
      "docs": [
        "User claims their principal + APY share"
      ],
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "docs": [
        "User deposits SOL into the vault"
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endEpoch",
      "docs": [
        "End the epoch: admin pays yield, distribute to vault/treasuries"
      ],
      "discriminator": [
        195,
        166,
        17,
        226,
        105,
        210,
        96,
        216
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "nctTreasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeGlobal",
      "docs": [
        "Initialize the global state and vault PDA"
      ],
      "discriminator": [
        47,
        225,
        15,
        112,
        86,
        51,
        190,
        231
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "treasury",
          "type": "pubkey"
        },
        {
          "name": "nctTreasury",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeUser",
      "docs": [
        "Initialize user state PDA for a new user"
      ],
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "newEpoch",
      "docs": [
        "Start a new epoch: reset for next round"
      ],
      "discriminator": [
        145,
        132,
        28,
        115,
        100,
        138,
        253,
        96
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "startEpoch",
      "docs": [
        "Lock deposits and start the investing phase"
      ],
      "discriminator": [
        204,
        248,
        232,
        82,
        251,
        45,
        164,
        113
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "userState",
      "discriminator": [
        72,
        177,
        85,
        249,
        76,
        167,
        186,
        126
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidEpochPhase",
      "msg": "Invalid epoch phase for this operation"
    },
    {
      "code": 6001,
      "name": "unauthorizedAdmin",
      "msg": "Only admin can perform this action"
    },
    {
      "code": 6002,
      "name": "invalidDepositAmount",
      "msg": "Deposit amount must be greater than zero"
    },
    {
      "code": 6003,
      "name": "insufficientBalance",
      "msg": "Withdraw amount exceeds deposited balance"
    },
    {
      "code": 6004,
      "name": "noApyToClaim",
      "msg": "No APY available to claim"
    },
    {
      "code": 6005,
      "name": "alreadyClaimed",
      "msg": "Already claimed for this epoch"
    },
    {
      "code": 6006,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6007,
      "name": "noDeposits",
      "msg": "User has no deposits"
    },
    {
      "code": 6008,
      "name": "vaultEmpty",
      "msg": "Vault is empty"
    },
    {
      "code": 6009,
      "name": "depositNotAllowed",
      "msg": "Cannot deposit during this phase"
    },
    {
      "code": 6010,
      "name": "claimNotAllowed",
      "msg": "Cannot claim during this phase"
    },
    {
      "code": 6011,
      "name": "withdrawNotAllowed",
      "msg": "Cannot withdraw during this phase"
    },
    {
      "code": 6012,
      "name": "insufficientYieldFunds",
      "msg": "Insufficient funds in admin wallet for yield distribution"
    }
  ],
  "types": [
    {
      "name": "epochPhase",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "deposit"
          },
          {
            "name": "investing"
          },
          {
            "name": "claiming"
          }
        ]
      }
    },
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "Admin authority pubkey"
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "Platform fee receiver (1%)"
            ],
            "type": "pubkey"
          },
          {
            "name": "nctTreasury",
            "docs": [
              "NCT token receiver for bridging (2%)"
            ],
            "type": "pubkey"
          },
          {
            "name": "currentEpoch",
            "docs": [
              "Current epoch number"
            ],
            "type": "u64"
          },
          {
            "name": "epochPhase",
            "docs": [
              "Current phase of the epoch"
            ],
            "type": {
              "defined": {
                "name": "epochPhase"
              }
            }
          },
          {
            "name": "totalDeposited",
            "docs": [
              "Total SOL deposited by all users (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "totalUsers",
            "docs": [
              "Number of active users"
            ],
            "type": "u64"
          },
          {
            "name": "yieldPerLamport",
            "docs": [
              "Yield per lamport (scaled by 1e9) - set after end_epoch"
            ],
            "type": "u64"
          },
          {
            "name": "nctYieldPerLamport",
            "docs": [
              "NCT yield per lamport (scaled by 1e9) - for tracking user NCT contributions"
            ],
            "type": "u64"
          },
          {
            "name": "lastEpochApyBps",
            "docs": [
              "Last epoch's APY in basis points (e.g., 1200 = 12%) - set after end_epoch"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump for global state PDA"
            ],
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "docs": [
              "Bump for vault PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Owner of this user state"
            ],
            "type": "pubkey"
          },
          {
            "name": "depositedAmount",
            "docs": [
              "Total SOL deposited (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "depositEpoch",
            "docs": [
              "Epoch when user deposited"
            ],
            "type": "u64"
          },
          {
            "name": "lastClaimedEpoch",
            "docs": [
              "Last epoch when user claimed"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "docs": [
              "Total APY claimed historically (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "totalNctContributed",
            "docs": [
              "Total NCT contribution from this user across all epochs (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump for user state PDA"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "globalSeed",
      "type": "bytes",
      "value": "[103, 108, 111, 98, 97, 108]"
    },
    {
      "name": "userSeed",
      "type": "bytes",
      "value": "[117, 115, 101, 114]"
    },
    {
      "name": "vaultSeed",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    }
  ]
};
