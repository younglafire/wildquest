use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{instruction::Instruction, system_program},
        AccountDeserialize, AccountSerialize, InstructionData, ToAccountMetas,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
};

fn create_test_svm() -> LiteSVM {
    let mut svm = LiteSVM::new();
    let program_bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/wildquest.so"
    ));
    svm.add_program(wildquest::id(), program_bytes).unwrap();
    svm
}

fn send_instruction(svm: &mut LiteSVM, payer: &Keypair, instruction: Instruction) -> bool {
    let blockhash = svm.latest_blockhash();
    let message = Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);
    let transaction =
        VersionedTransaction::try_new(VersionedMessage::Legacy(message), &[payer]).unwrap();
    svm.send_transaction(transaction).is_ok()
}

fn find_player_pda(payer: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[wildquest::constants::PLAYER_SEED, payer.as_ref()],
        &wildquest::id(),
    )
    .0
}

fn initialize_player(svm: &mut LiteSVM, payer: &Keypair) -> Pubkey {
    let player = find_player_pda(&payer.pubkey());
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializePlayer {}.data(),
        wildquest::accounts::InitializePlayer {
            payer: payer.pubkey(),
            player,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(send_instruction(svm, payer, instruction));
    player
}

fn find_discovery_pda(payer: &Pubkey, proof_hash: &[u8; 32]) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wildquest::constants::DISCOVERY_SEED,
            payer.as_ref(),
            proof_hash.as_ref(),
        ],
        &wildquest::id(),
    )
    .0
}

fn discovery_instruction(
    payer: &Keypair,
    player: Pubkey,
    species_id: u64,
    grade: u8,
    rarity: u8,
    proof_hash: [u8; 32],
) -> (Instruction, Pubkey) {
    let discovery = find_discovery_pda(&payer.pubkey(), &proof_hash);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::DiscoverSpecies {
            species_id,
            grade,
            rarity,
            proof_hash,
        }
        .data(),
        wildquest::accounts::DiscoverSpeciesAccountConstraints {
            payer: payer.pubkey(),
            player,
            discovery,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    (instruction, discovery)
}

fn read_player(svm: &LiteSVM, player: &Pubkey) -> wildquest::state::Player {
    let player_account = svm.get_account(player).unwrap();
    let mut data: &[u8] = &player_account.data;
    wildquest::state::Player::try_deserialize(&mut data).unwrap()
}

fn write_player(svm: &mut LiteSVM, player: Pubkey, state: &wildquest::state::Player) {
    let mut account = svm.get_account(&player).unwrap();
    let mut data = Vec::with_capacity(account.data.len());
    state.try_serialize(&mut data).unwrap();
    assert_eq!(data.len(), account.data.len());
    account.data = data;
    svm.set_account(player, account).unwrap();
}

#[test]
fn test_initialize() {
    let program_id = wildquest::id();
    let payer = Keypair::new();
    let counter =
        Pubkey::find_program_address(&[wildquest::constants::COUNTER_SEED], &program_id).0;
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
    let player = Pubkey::find_program_address(&[b"player", payer.pubkey().as_ref()], &program_id).0;
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
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);

    let captures = [
        (41, 1, 0, [1u8; 32], 50, 1, 1),
        (41, 2, 0, [2u8; 32], 125, 2, 2),
        (43, 3, 4, [3u8; 32], 225, 3, 3),
    ];

    for (species_id, grade, rarity, proof_hash, xp, level, discovery_count) in captures {
        let (instruction, discovery) =
            discovery_instruction(&payer, player, species_id, grade, rarity, proof_hash);
        assert!(send_instruction(&mut svm, &payer, instruction));

        let discovery_account = svm.get_account(&discovery).unwrap();
        let mut data: &[u8] = &discovery_account.data;
        let discovery_state = wildquest::state::Discovery::try_deserialize(&mut data).unwrap();
        assert_eq!(discovery_state.player, payer.pubkey());
        assert_eq!(discovery_state.species_id, species_id);
        assert_eq!(discovery_state.grade, grade);
        assert_eq!(discovery_state.rarity, rarity);
        assert_eq!(discovery_state.proof_hash, proof_hash);

        let player_state = read_player(&svm, &player);
        assert_eq!(player_state.xp, xp);
        assert_eq!(player_state.level, level);
        assert_eq!(player_state.discovery_count, discovery_count);
    }

    let (duplicate_instruction, _) = discovery_instruction(&payer, player, 99, 3, 4, [1u8; 32]);
    assert!(!send_instruction(&mut svm, &payer, duplicate_instruction));
    let player_state = read_player(&svm, &player);
    assert_eq!(player_state.xp, 225);
    assert_eq!(player_state.level, 3);
    assert_eq!(player_state.discovery_count, 3);
}

#[test]
fn test_discover_species_rejects_invalid_game_values() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);

    let (invalid_grade_instruction, invalid_grade_discovery) =
        discovery_instruction(&payer, player, 51, 4, 0, [4u8; 32]);
    assert!(!send_instruction(
        &mut svm,
        &payer,
        invalid_grade_instruction
    ));
    assert!(svm.get_account(&invalid_grade_discovery).is_none());

    let (invalid_rarity_instruction, invalid_rarity_discovery) =
        discovery_instruction(&payer, player, 52, 1, 5, [5u8; 32]);
    assert!(!send_instruction(
        &mut svm,
        &payer,
        invalid_rarity_instruction
    ));
    assert!(svm.get_account(&invalid_rarity_discovery).is_none());

    let player_state = read_player(&svm, &player);
    assert_eq!(player_state.xp, 0);
    assert_eq!(player_state.level, 1);
    assert_eq!(player_state.discovery_count, 0);
}

#[test]
fn test_discover_species_rejects_another_wallets_player_pda() {
    let payer = Keypair::new();
    let other_payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&other_payer.pubkey(), 1_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);
    let other_player = initialize_player(&mut svm, &other_payer);

    let (instruction, discovery) = discovery_instruction(&payer, other_player, 61, 1, 0, [6u8; 32]);
    assert!(!send_instruction(&mut svm, &payer, instruction));
    assert!(svm.get_account(&discovery).is_none());

    let player_state = read_player(&svm, &player);
    let other_player_state = read_player(&svm, &other_player);
    assert_eq!(player_state.xp, 0);
    assert_eq!(other_player_state.xp, 0);
}

#[test]
fn test_discover_species_rolls_back_progression_overflow() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);

    let mut player_state = read_player(&svm, &player);
    player_state.xp = u64::MAX;
    player_state.discovery_count = 7;
    write_player(&mut svm, player, &player_state);

    let (instruction, discovery) = discovery_instruction(&payer, player, 71, 1, 0, [7u8; 32]);
    assert!(!send_instruction(&mut svm, &payer, instruction));
    assert!(svm.get_account(&discovery).is_none());

    let unchanged_player = read_player(&svm, &player);
    assert_eq!(unchanged_player.xp, u64::MAX);
    assert_eq!(unchanged_player.level, 1);
    assert_eq!(unchanged_player.discovery_count, 7);
}
