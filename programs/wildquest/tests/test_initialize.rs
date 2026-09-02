
use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{instruction::Instruction, system_program},
        AccountDeserialize, InstructionData, ToAccountMetas,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
};

#[test]
fn test_initialize() {
    let program_id = wildquest::id();
    let payer = Keypair::new();
    let counter = Pubkey::find_program_address(
        &[wildquest::constants::COUNTER_SEED],
        &program_id,
    )
    .0;
    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/wildquest.so"
    ));
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();

    let instruction = Instruction::new_with_bytes(
        program_id,
        &wildquest::instruction::Initialize {}.data(),
        wildquest::accounts::Initialize {
            payer: payer.pubkey(),
            counter,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok());

    let counter_account = svm.get_account(&counter).unwrap();
    let mut data: &[u8] = &counter_account.data;
    let counter_state = wildquest::state::Counter::try_deserialize(&mut data).unwrap();
    assert_eq!(counter_state.count, 0);
    assert_eq!(counter_state.authority, payer.pubkey());

    let instruction = Instruction::new_with_bytes(
        program_id,
        &wildquest::instruction::Increment {}.data(),
        wildquest::accounts::Increment {
            counter,
            authority: payer.pubkey(),
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok());

    let counter_account = svm.get_account(&counter).unwrap();
    let mut data: &[u8] = &counter_account.data;
    let counter_state = wildquest::state::Counter::try_deserialize(&mut data).unwrap();
    assert_eq!(counter_state.count, 1);
    assert_eq!(counter_state.authority, payer.pubkey());
}

#[test]
fn test_initialize_player() {
    let program_id = wildquest::id();
    let payer = Keypair::new();
    let player = Pubkey::find_program_address(
        &[b"player", payer.pubkey().as_ref()],
        &program_id,
    )
    .0;
    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/wildquest.so"
    ));
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();

    let instruction = Instruction::new_with_bytes(
        program_id,
        &wildquest::instruction::InitializePlayer {}.data(),
        wildquest::accounts::InitializePlayer {
            payer: payer.pubkey(),
            player,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok());

    let player_account = svm.get_account(&player).unwrap();
    let mut data: &[u8] = &player_account.data;
    let player_state = wildquest::state::Player::try_deserialize(&mut data).unwrap();
    assert_eq!(player_state.wallet, payer.pubkey());
    assert_eq!(player_state.xp, 0);
    assert_eq!(player_state.level, 1);
    assert_eq!(player_state.discovery_count, 0);
    assert_eq!(player_state.badge_count, 0);
}

#[test]
fn test_discover_species() {
    let program_id = wildquest::id();
    let payer = Keypair::new();
    let species_id: u64 = 42;
    let proof_hash = [7u8; 32];
    let discovery = Pubkey::find_program_address(
        &[
            b"discovery",
            payer.pubkey().as_ref(),
            species_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    )
    .0;
    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/wildquest.so"
    ));
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();

    let instruction = Instruction::new_with_bytes(
        program_id,
        &wildquest::instruction::DiscoverSpecies {
            species_id,
            grade: 3,
            rarity: 2,
            proof_hash,
        }
        .data(),
        wildquest::accounts::DiscoverSpecies {
            payer: payer.pubkey(),
            discovery,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok());

    let discovery_account = svm.get_account(&discovery).unwrap();
    let mut data: &[u8] = &discovery_account.data;
    let discovery_state = wildquest::state::Discovery::try_deserialize(&mut data).unwrap();
    assert_eq!(discovery_state.player, payer.pubkey());
    assert_eq!(discovery_state.species_id, species_id);
    assert_eq!(discovery_state.grade, 3);
    assert_eq!(discovery_state.rarity, 2);
    assert_eq!(discovery_state.proof_hash, proof_hash);
}
