use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{
            instruction::{AccountMeta, Instruction},
            system_program,
        },
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
    match svm.send_transaction(transaction) {
        Ok(_) => true,
        Err(error) => {
            eprintln!("transaction failed: {error:?}");
            false
        }
    }
}

fn send_instruction_with_capture_authority(
    svm: &mut LiteSVM,
    owner: &Keypair,
    capture_authority: &Keypair,
    instruction: Instruction,
) -> bool {
    let blockhash = svm.latest_blockhash();
    let message = Message::new_with_blockhash(&[instruction], Some(&owner.pubkey()), &blockhash);
    let transaction = VersionedTransaction::try_new(
        VersionedMessage::Legacy(message),
        &[owner, capture_authority],
    )
    .unwrap();
    svm.send_transaction(transaction).is_ok()
}

fn find_game_config_pda() -> Pubkey {
    Pubkey::find_program_address(&[wildquest::constants::GAME_CONFIG_SEED], &wildquest::id()).0
}

fn initialize_game_config(svm: &mut LiteSVM, admin: &Keypair, capture_authority: Pubkey) -> Pubkey {
    let game_config = find_game_config_pda();
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializeGameConfig { capture_authority }.data(),
        wildquest::accounts::InitializeGameConfigAccountConstraints {
            admin: admin.pubkey(),
            game_config,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(send_instruction(svm, admin, instruction));
    game_config
}

fn find_species_config_pda(catalogue_id: u64) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wildquest::constants::SPECIES_CONFIG_SEED,
            catalogue_id.to_le_bytes().as_ref(),
            wildquest::constants::BALANCE_VERSION.to_le_bytes().as_ref(),
        ],
        &wildquest::id(),
    )
    .0
}

fn initialize_species_config(
    svm: &mut LiteSVM,
    admin: &Keypair,
    game_config: Pubkey,
    catalogue_id: u64,
) -> Pubkey {
    let species_config = find_species_config_pda(catalogue_id);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializeSpeciesConfig { catalogue_id }.data(),
        wildquest::accounts::InitializeSpeciesConfigAccountConstraints {
            admin: admin.pubkey(),
            game_config,
            species_config,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(send_instruction(svm, admin, instruction));
    species_config
}

fn find_creature_pda(owner: &Pubkey, catalogue_id: u64) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wildquest::constants::CREATURE_SEED,
            owner.as_ref(),
            catalogue_id.to_le_bytes().as_ref(),
        ],
        &wildquest::id(),
    )
    .0
}

fn capture_creature_instruction(
    owner: Pubkey,
    capture_authority: Pubkey,
    game_config: Pubkey,
    species_config: Pubkey,
    catalogue_id: u64,
    proof_hash: [u8; 32],
) -> (Instruction, Pubkey) {
    let creature = find_creature_pda(&owner, catalogue_id);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::CaptureCreature {
            catalogue_id,
            proof_hash,
        }
        .data(),
        wildquest::accounts::CaptureCreatureAccountConstraints {
            owner,
            capture_authority,
            game_config,
            species_config,
            creature,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    (instruction, creature)
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

fn find_quest_pda(quest_id: u64) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wildquest::constants::QUEST_SEED,
            quest_id.to_le_bytes().as_ref(),
        ],
        &wildquest::id(),
    )
    .0
}

fn initialize_quest(svm: &mut LiteSVM, payer: &Keypair, quest_id: u64) -> Pubkey {
    let quest = find_quest_pda(quest_id);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializeQuest { quest_id }.data(),
        wildquest::accounts::InitializeQuestAccountConstraints {
            payer: payer.pubkey(),
            quest,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(send_instruction(svm, payer, instruction));
    quest
}

fn read_quest(svm: &LiteSVM, quest: &Pubkey) -> wildquest::state::Quest {
    let quest_account = svm.get_account(quest).unwrap();
    let mut data: &[u8] = &quest_account.data;
    wildquest::state::Quest::try_deserialize(&mut data).unwrap()
}

fn find_quest_completion_pda(quest: &Pubkey, payer: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wildquest::constants::QUEST_COMPLETION_SEED,
            quest.as_ref(),
            payer.as_ref(),
        ],
        &wildquest::id(),
    )
    .0
}

fn complete_quest_instruction(
    payer: &Keypair,
    player: Pubkey,
    quest: Pubkey,
    quest_id: u64,
    discoveries: &[Pubkey],
) -> (Instruction, Pubkey) {
    let quest_completion = find_quest_completion_pda(&quest, &payer.pubkey());
    let mut account_metas = wildquest::accounts::CompleteQuestAccountConstraints {
        payer: payer.pubkey(),
        player,
        quest,
        quest_completion,
        system_program: system_program::ID,
    }
    .to_account_metas(None);
    account_metas.extend(
        discoveries
            .iter()
            .map(|discovery| AccountMeta::new_readonly(*discovery, false)),
    );
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::CompleteQuest { quest_id }.data(),
        account_metas,
    );
    (instruction, quest_completion)
}

fn create_discoveries(
    svm: &mut LiteSVM,
    payer: &Keypair,
    player: Pubkey,
    species_ids: &[u64],
) -> Vec<Pubkey> {
    species_ids
        .iter()
        .enumerate()
        .map(|(index, species_id)| {
            let mut proof_hash = [0u8; 32];
            proof_hash[0] = u8::try_from(index).unwrap().checked_add(20).unwrap();
            let (instruction, discovery) =
                discovery_instruction(payer, player, *species_id, 1, 0, proof_hash);
            assert!(send_instruction(svm, payer, instruction));
            discovery
        })
        .collect()
}

fn write_player(svm: &mut LiteSVM, player: Pubkey, state: &wildquest::state::Player) {
    let mut account = svm.get_account(&player).unwrap();
    let mut data = Vec::with_capacity(account.data.len());
    state.try_serialize(&mut data).unwrap();
    assert_eq!(data.len(), account.data.len());
    account.data = data;
    svm.set_account(player, account).unwrap();
}

fn write_game_config(svm: &mut LiteSVM, game_config: Pubkey, state: &wildquest::state::GameConfig) {
    let mut account = svm.get_account(&game_config).unwrap();
    let mut data = Vec::with_capacity(account.data.len());
    state.try_serialize(&mut data).unwrap();
    assert_eq!(data.len(), account.data.len());
    account.data = data;
    svm.set_account(game_config, account).unwrap();
}

fn capture_creature(
    svm: &mut LiteSVM,
    owner: &Keypair,
    capture_authority: &Keypair,
    game_config: Pubkey,
    species_config: Pubkey,
    catalogue_id: u64,
    proof_byte: u8,
) -> Pubkey {
    let (instruction, creature) = capture_creature_instruction(
        owner.pubkey(),
        capture_authority.pubkey(),
        game_config,
        species_config,
        catalogue_id,
        [proof_byte; 32],
    );
    assert!(send_instruction_with_capture_authority(
        svm,
        owner,
        capture_authority,
        instruction
    ));
    creature
}

fn find_match_pda(creator: &Pubkey, match_id: u64) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wildquest::constants::MATCH_SEED,
            creator.as_ref(),
            match_id.to_le_bytes().as_ref(),
        ],
        &wildquest::id(),
    )
    .0
}

fn open_match_instruction(
    creator: Pubkey,
    game_config: Pubkey,
    match_id: u64,
    creatures: [Pubkey; 3],
) -> (Instruction, Pubkey) {
    let match_account = find_match_pda(&creator, match_id);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::OpenMatch { match_id }.data(),
        wildquest::accounts::OpenMatchAccountConstraints {
            creator,
            game_config,
            match_account,
            creator_creature_1: creatures[0],
            creator_creature_2: creatures[1],
            creator_creature_3: creatures[2],
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    (instruction, match_account)
}

fn join_match_instruction(
    opponent: Pubkey,
    creator: Pubkey,
    game_config: Pubkey,
    match_account: Pubkey,
    creator_creatures: [Pubkey; 3],
    opponent_creatures: [Pubkey; 3],
    _creator_species: [Pubkey; 3],
    _opponent_species: [Pubkey; 3],
) -> Instruction {
    let mut account_metas = wildquest::accounts::JoinMatchAccountConstraints {
        opponent,
        creator,
        game_config,
        match_account,
    }
    .to_account_metas(None);
    account_metas.extend(
        creator_creatures
            .into_iter()
            .chain(opponent_creatures)
            .map(|account| AccountMeta::new_readonly(account, false)),
    );
    account_metas.push(AccountMeta::new_readonly(system_program::ID, false));
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::JoinMatch {}.data(),
        account_metas,
    )
}

fn resolve_match_instruction(
    resolver: Pubkey,
    game_config: Pubkey,
    creator: Pubkey,
    opponent: Pubkey,
    match_account: Pubkey,
    winner: Option<Pubkey>,
) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::ResolveMatch {
            winner,
            turn_count: 3,
            result_hash: [7; 32],
        }
        .data(),
        wildquest::accounts::ResolveMatchAccountConstraints {
            resolver,
            game_config,
            creator,
            opponent,
            match_account,
        }
        .to_account_metas(None),
    )
}

fn cancel_match_instruction(creator: Pubkey, match_account: Pubkey) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::CancelMatch {}.data(),
        wildquest::accounts::CancelMatchAccountConstraints {
            creator,
            match_account,
        }
        .to_account_metas(None),
    )
}

fn claim_match_payout_instruction(winner: Pubkey, match_account: Pubkey) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::ClaimMatchPayout {}.data(),
        wildquest::accounts::ClaimMatchPayoutAccountConstraints {
            winner,
            match_account,
        }
        .to_account_metas(None),
    )
}

fn refund_stale_match_instruction(
    participant: Pubkey,
    creator: Pubkey,
    opponent: Pubkey,
    match_account: Pubkey,
) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::RefundStaleMatch {}.data(),
        wildquest::accounts::RefundStaleMatchAccountConstraints {
            participant,
            creator,
            opponent,
            match_account,
        }
        .to_account_metas(None),
    )
}

fn release_creature_instruction(owner: Pubkey, creature: Pubkey) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::ReleaseCreature {}.data(),
        wildquest::accounts::ReleaseCreatureAccountConstraints { owner, creature }
            .to_account_metas(None),
    )
}

fn admin_close_creature_instruction(
    admin: Pubkey,
    game_config: Pubkey,
    creature: Pubkey,
    owner: Pubkey,
) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::AdminCloseCreature {}.data(),
        wildquest::accounts::AdminCloseCreatureAccountConstraints {
            admin,
            game_config,
            creature,
            owner,
        }
        .to_account_metas(None),
    )
}

fn admin_close_match_instruction(
    admin: Pubkey,
    game_config: Pubkey,
    match_account: Pubkey,
    creator: Pubkey,
    payout_recipient: Pubkey,
) -> Instruction {
    Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::AdminCloseMatch {}.data(),
        wildquest::accounts::AdminCloseMatchAccountConstraints {
            admin,
            game_config,
            match_account,
            creator,
            payout_recipient,
        }
        .to_account_metas(None),
    )
}

fn read_match(svm: &LiteSVM, match_account: &Pubkey) -> wildquest::state::Match {
    let account = svm.get_account(match_account).unwrap();
    let mut data: &[u8] = &account.data;
    wildquest::state::Match::try_deserialize(&mut data).unwrap()
}

fn initialize_battle_configs(
    svm: &mut LiteSVM,
    admin: &Keypair,
    game_config: Pubkey,
) -> [Pubkey; 6] {
    std::array::from_fn(|index| {
        initialize_species_config(
            svm,
            admin,
            game_config,
            wildquest::constants::BATTLE_CATALOGUE_IDS[index],
        )
    })
}

fn capture_team(
    svm: &mut LiteSVM,
    owner: &Keypair,
    capture_authority: &Keypair,
    game_config: Pubkey,
    species_configs: &[Pubkey; 6],
    indexes: [usize; 3],
    proof_start: u8,
) -> [Pubkey; 3] {
    std::array::from_fn(|slot| {
        let index = indexes[slot];
        capture_creature(
            svm,
            owner,
            capture_authority,
            game_config,
            species_configs[index],
            wildquest::constants::BATTLE_CATALOGUE_IDS[index],
            proof_start
                .checked_add(u8::try_from(slot).unwrap())
                .unwrap(),
        )
    })
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

#[test]
fn test_initialize_demo_quest() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    let balance_before = svm.get_balance(&payer.pubkey()).unwrap();

    let quest = initialize_quest(&mut svm, &payer, wildquest::constants::DEMO_QUEST_ID);
    let quest_state = read_quest(&svm, &quest);

    assert_eq!(quest_state.quest_id, wildquest::constants::DEMO_QUEST_ID);
    assert_eq!(
        usize::from(quest_state.species_count),
        wildquest::constants::DEMO_QUEST_TARGETS.len()
    );
    assert_eq!(
        quest_state.targets,
        wildquest::constants::DEMO_QUEST_TARGETS
    );
    assert_eq!(
        quest_state.reward_xp,
        wildquest::constants::DEMO_QUEST_REWARD_XP
    );
    assert_eq!(
        quest_state.bump,
        Pubkey::find_program_address(
            &[
                wildquest::constants::QUEST_SEED,
                wildquest::constants::DEMO_QUEST_ID.to_le_bytes().as_ref(),
            ],
            &wildquest::id(),
        )
        .1
    );
    assert!(svm.get_balance(&payer.pubkey()).unwrap() < balance_before);
}

#[test]
fn test_initialize_quest_rejects_unknown_definition() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    let unknown_quest_id = 77;
    let quest = find_quest_pda(unknown_quest_id);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializeQuest {
            quest_id: unknown_quest_id,
        }
        .data(),
        wildquest::accounts::InitializeQuestAccountConstraints {
            payer: payer.pubkey(),
            quest,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    assert!(!send_instruction(&mut svm, &payer, instruction));
    assert!(svm.get_account(&quest).is_none());
}

#[test]
fn test_complete_quest_awards_xp_level_and_badge_once() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 2_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);
    let quest = initialize_quest(&mut svm, &payer, wildquest::constants::DEMO_QUEST_ID);
    let discoveries = create_discoveries(
        &mut svm,
        &payer,
        player,
        &wildquest::constants::DEMO_QUEST_TARGETS,
    );
    let balance_before = svm.get_balance(&payer.pubkey()).unwrap();
    let expected_timestamp = svm
        .get_sysvar::<anchor_lang::prelude::Clock>()
        .unix_timestamp;

    let (instruction, quest_completion) = complete_quest_instruction(
        &payer,
        player,
        quest,
        wildquest::constants::DEMO_QUEST_ID,
        &discoveries,
    );
    assert!(send_instruction(&mut svm, &payer, instruction));

    let player_state = read_player(&svm, &player);
    assert_eq!(player_state.xp, 350);
    assert_eq!(player_state.level, 4);
    assert_eq!(player_state.discovery_count, 5);
    assert_eq!(player_state.badge_count, 1);

    let completion_account = svm.get_account(&quest_completion).unwrap();
    let mut data: &[u8] = &completion_account.data;
    let completion = wildquest::state::QuestCompletion::try_deserialize(&mut data).unwrap();
    assert_eq!(completion.quest, quest);
    assert_eq!(completion.player, payer.pubkey());
    assert_eq!(
        completion.reward_xp,
        wildquest::constants::DEMO_QUEST_REWARD_XP
    );
    assert_eq!(completion.completed_at, expected_timestamp);
    assert!(svm.get_balance(&payer.pubkey()).unwrap() < balance_before);

    let (duplicate_instruction, _) = complete_quest_instruction(
        &payer,
        player,
        quest,
        wildquest::constants::DEMO_QUEST_ID,
        &discoveries,
    );
    assert!(!send_instruction(&mut svm, &payer, duplicate_instruction));
    let unchanged_player = read_player(&svm, &player);
    assert_eq!(unchanged_player.xp, 350);
    assert_eq!(unchanged_player.badge_count, 1);
}

#[test]
fn test_complete_quest_rejects_missing_or_wrong_targets() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 2_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);
    let quest = initialize_quest(&mut svm, &payer, wildquest::constants::DEMO_QUEST_ID);
    let wrong_species = [3, 5, 8, 9, 12];
    let discoveries = create_discoveries(&mut svm, &payer, player, &wrong_species);

    let (short_instruction, completion) = complete_quest_instruction(
        &payer,
        player,
        quest,
        wildquest::constants::DEMO_QUEST_ID,
        &discoveries[..4],
    );
    assert!(!send_instruction(&mut svm, &payer, short_instruction));
    assert!(svm.get_account(&completion).is_none());

    let (wrong_instruction, completion) = complete_quest_instruction(
        &payer,
        player,
        quest,
        wildquest::constants::DEMO_QUEST_ID,
        &discoveries,
    );
    assert!(!send_instruction(&mut svm, &payer, wrong_instruction));
    assert!(svm.get_account(&completion).is_none());
    let player_state = read_player(&svm, &player);
    assert_eq!(player_state.xp, 250);
    assert_eq!(player_state.badge_count, 0);
}

#[test]
fn test_complete_quest_rejects_another_players_discovery() {
    let payer = Keypair::new();
    let other_payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 2_000_000_000).unwrap();
    svm.airdrop(&other_payer.pubkey(), 1_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);
    let other_player = initialize_player(&mut svm, &other_payer);
    let quest = initialize_quest(&mut svm, &payer, wildquest::constants::DEMO_QUEST_ID);
    let mut discoveries = create_discoveries(
        &mut svm,
        &payer,
        player,
        &wildquest::constants::DEMO_QUEST_TARGETS,
    );
    let other_discovery = create_discoveries(&mut svm, &other_payer, other_player, &[11])[0];
    discoveries[4] = other_discovery;

    let (instruction, completion) = complete_quest_instruction(
        &payer,
        player,
        quest,
        wildquest::constants::DEMO_QUEST_ID,
        &discoveries,
    );
    assert!(!send_instruction(&mut svm, &payer, instruction));
    assert!(svm.get_account(&completion).is_none());
    let player_state = read_player(&svm, &player);
    assert_eq!(player_state.xp, 250);
    assert_eq!(player_state.badge_count, 0);
}

#[test]
fn test_complete_quest_rolls_back_progression_overflow() {
    let payer = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&payer.pubkey(), 2_000_000_000).unwrap();
    let player = initialize_player(&mut svm, &payer);
    let quest = initialize_quest(&mut svm, &payer, wildquest::constants::DEMO_QUEST_ID);
    let discoveries = create_discoveries(
        &mut svm,
        &payer,
        player,
        &wildquest::constants::DEMO_QUEST_TARGETS,
    );
    let mut player_state = read_player(&svm, &player);
    player_state.xp = u64::MAX;
    write_player(&mut svm, player, &player_state);

    let (instruction, completion) = complete_quest_instruction(
        &payer,
        player,
        quest,
        wildquest::constants::DEMO_QUEST_ID,
        &discoveries,
    );
    assert!(!send_instruction(&mut svm, &payer, instruction));
    assert!(svm.get_account(&completion).is_none());
    let unchanged_player = read_player(&svm, &player);
    assert_eq!(unchanged_player.xp, u64::MAX);
    assert_eq!(unchanged_player.badge_count, 0);
}

#[test]
fn test_activate_turn_combat_requires_admin_and_updates_existing_config() {
    let admin = Keypair::new();
    let wrong_admin = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&admin.pubkey(), 2_000_000_000).unwrap();
    svm.airdrop(&wrong_admin.pubkey(), 2_000_000_000).unwrap();
    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let account = svm.get_account(&game_config).unwrap();
    let mut data: &[u8] = &account.data;
    let mut state = wildquest::state::GameConfig::try_deserialize(&mut data).unwrap();
    state.rules_version = 1;
    write_game_config(&mut svm, game_config, &state);

    let instruction = |signer: Pubkey| {
        Instruction::new_with_bytes(
            wildquest::id(),
            &wildquest::instruction::ActivateTurnCombat {}.data(),
            wildquest::accounts::ActivateTurnCombatAccountConstraints {
                admin: signer,
                game_config,
            }
            .to_account_metas(None),
        )
    };
    assert!(!send_instruction(
        &mut svm,
        &wrong_admin,
        instruction(wrong_admin.pubkey())
    ));
    assert_eq!(
        {
            let account = svm.get_account(&game_config).unwrap();
            let mut data: &[u8] = &account.data;
            wildquest::state::GameConfig::try_deserialize(&mut data)
                .unwrap()
                .rules_version
        },
        1
    );
    assert!(send_instruction(
        &mut svm,
        &admin,
        instruction(admin.pubkey())
    ));
    let account = svm.get_account(&game_config).unwrap();
    let mut data: &[u8] = &account.data;
    let updated = wildquest::state::GameConfig::try_deserialize(&mut data).unwrap();
    assert_eq!(updated.rules_version, wildquest::constants::RULES_VERSION);
}

#[test]
fn test_initialize_battle_species_configs() {
    let admin = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&admin.pubkey(), 2_000_000_000).unwrap();
    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());

    let game_account = svm.get_account(&game_config).unwrap();
    let mut game_data: &[u8] = &game_account.data;
    let game = wildquest::state::GameConfig::try_deserialize(&mut game_data).unwrap();
    assert_eq!(game.admin, admin.pubkey());
    assert_eq!(game.capture_authority, capture_authority.pubkey());
    assert_eq!(game.balance_version, wildquest::constants::BALANCE_VERSION);
    assert_eq!(game.rules_version, wildquest::constants::RULES_VERSION);
    assert_eq!(
        game.stake_lamports,
        wildquest::constants::MATCH_STAKE_LAMPORTS
    );

    for (index, catalogue_id) in wildquest::constants::BATTLE_CATALOGUE_IDS
        .iter()
        .enumerate()
    {
        let species_config =
            initialize_species_config(&mut svm, &admin, game_config, *catalogue_id);
        let account = svm.get_account(&species_config).unwrap();
        let mut data: &[u8] = &account.data;
        let config = wildquest::state::SpeciesConfig::try_deserialize(&mut data).unwrap();
        let [hp, attack, defense, speed, shield] = wildquest::constants::BATTLE_STATS[index];
        assert_eq!(config.catalogue_id, *catalogue_id);
        assert_eq!(
            config.model_class_id,
            wildquest::constants::BATTLE_MODEL_CLASS_IDS[index]
        );
        assert_eq!(
            [
                config.hp,
                config.attack,
                config.defense,
                config.speed,
                config.shield,
            ],
            [hp, attack, defense, speed, shield]
        );
        assert!(config.active);
        assert_eq!(
            config.balance_version,
            wildquest::constants::BALANCE_VERSION
        );
    }
}

#[test]
fn test_capture_creature_enforces_one_per_catalogue_id() {
    let owner = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&owner.pubkey(), 2_000_000_000).unwrap();
    let game_config = initialize_game_config(&mut svm, &owner, capture_authority.pubkey());
    let catalogue_id = wildquest::constants::BATTLE_CATALOGUE_IDS[1];
    let species_config = initialize_species_config(&mut svm, &owner, game_config, catalogue_id);
    let proof_hash = [7u8; 32];
    let (instruction, creature) = capture_creature_instruction(
        owner.pubkey(),
        capture_authority.pubkey(),
        game_config,
        species_config,
        catalogue_id,
        proof_hash,
    );

    assert!(send_instruction_with_capture_authority(
        &mut svm,
        &owner,
        &capture_authority,
        instruction
    ));

    let account = svm.get_account(&creature).unwrap();
    let mut data: &[u8] = &account.data;
    let state = wildquest::state::Creature::try_deserialize(&mut data).unwrap();
    assert_eq!(state.owner, owner.pubkey());
    assert_eq!(state.catalogue_id, catalogue_id);
    assert_eq!(state.proof_hash, proof_hash);
    assert_eq!(state.balance_version, wildquest::constants::BALANCE_VERSION);

    let (duplicate, _) = capture_creature_instruction(
        owner.pubkey(),
        capture_authority.pubkey(),
        game_config,
        species_config,
        catalogue_id,
        [8u8; 32],
    );
    assert!(!send_instruction_with_capture_authority(
        &mut svm,
        &owner,
        &capture_authority,
        duplicate
    ));

    let unchanged = svm.get_account(&creature).unwrap();
    let mut unchanged_data: &[u8] = &unchanged.data;
    let unchanged_state = wildquest::state::Creature::try_deserialize(&mut unchanged_data).unwrap();
    assert_eq!(unchanged_state.proof_hash, proof_hash);
}

#[test]
fn test_capture_creature_rejects_wrong_authority_and_zero_proof() {
    let owner = Keypair::new();
    let capture_authority = Keypair::new();
    let wrong_authority = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&owner.pubkey(), 2_000_000_000).unwrap();
    let game_config = initialize_game_config(&mut svm, &owner, capture_authority.pubkey());
    let catalogue_id = wildquest::constants::BATTLE_CATALOGUE_IDS[0];
    let species_config = initialize_species_config(&mut svm, &owner, game_config, catalogue_id);

    let (wrong_instruction, creature) = capture_creature_instruction(
        owner.pubkey(),
        wrong_authority.pubkey(),
        game_config,
        species_config,
        catalogue_id,
        [9u8; 32],
    );
    assert!(!send_instruction_with_capture_authority(
        &mut svm,
        &owner,
        &wrong_authority,
        wrong_instruction
    ));
    assert!(svm.get_account(&creature).is_none());

    let (zero_proof_instruction, _) = capture_creature_instruction(
        owner.pubkey(),
        capture_authority.pubkey(),
        game_config,
        species_config,
        catalogue_id,
        [0u8; 32],
    );
    assert!(!send_instruction_with_capture_authority(
        &mut svm,
        &owner,
        &capture_authority,
        zero_proof_instruction
    ));
    assert!(svm.get_account(&creature).is_none());
}

#[test]
fn test_capture_creature_rejects_wrong_owner_pda() {
    let owner = Keypair::new();
    let other_owner = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&owner.pubkey(), 2_000_000_000).unwrap();
    let game_config = initialize_game_config(&mut svm, &owner, capture_authority.pubkey());
    let catalogue_id = wildquest::constants::BATTLE_CATALOGUE_IDS[2];
    let species_config = initialize_species_config(&mut svm, &owner, game_config, catalogue_id);
    let wrong_creature = find_creature_pda(&other_owner.pubkey(), catalogue_id);
    let instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::CaptureCreature {
            catalogue_id,
            proof_hash: [10u8; 32],
        }
        .data(),
        wildquest::accounts::CaptureCreatureAccountConstraints {
            owner: owner.pubkey(),
            capture_authority: capture_authority.pubkey(),
            game_config,
            species_config,
            creature: wrong_creature,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    assert!(!send_instruction_with_capture_authority(
        &mut svm,
        &owner,
        &capture_authority,
        instruction
    ));
    assert!(svm.get_account(&wrong_creature).is_none());
}

#[test]
fn test_initialize_species_config_rejects_unknown_species_and_wrong_admin() {
    let admin = Keypair::new();
    let wrong_admin = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    svm.airdrop(&admin.pubkey(), 2_000_000_000).unwrap();
    svm.airdrop(&wrong_admin.pubkey(), 2_000_000_000).unwrap();
    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());

    let unknown_catalogue_id = 9999;
    let unknown_config = find_species_config_pda(unknown_catalogue_id);
    let unknown_instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializeSpeciesConfig {
            catalogue_id: unknown_catalogue_id,
        }
        .data(),
        wildquest::accounts::InitializeSpeciesConfigAccountConstraints {
            admin: admin.pubkey(),
            game_config,
            species_config: unknown_config,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(!send_instruction(&mut svm, &admin, unknown_instruction));
    assert!(svm.get_account(&unknown_config).is_none());

    let catalogue_id = wildquest::constants::BATTLE_CATALOGUE_IDS[3];
    let config = find_species_config_pda(catalogue_id);
    let wrong_admin_instruction = Instruction::new_with_bytes(
        wildquest::id(),
        &wildquest::instruction::InitializeSpeciesConfig { catalogue_id }.data(),
        wildquest::accounts::InitializeSpeciesConfigAccountConstraints {
            admin: wrong_admin.pubkey(),
            game_config,
            species_config: config,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );
    assert!(!send_instruction(
        &mut svm,
        &wrong_admin,
        wrong_admin_instruction
    ));
    assert!(svm.get_account(&config).is_none());
}

#[test]
fn test_match_requires_winner_claim_and_rejects_replay() {
    let admin = Keypair::new();
    let creator = Keypair::new();
    let opponent = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &creator, &opponent] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }
    svm.airdrop(&capture_authority.pubkey(), 10_000_000)
        .unwrap();

    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let creator_indexes = [1, 2, 4];
    let opponent_indexes = [5, 0, 3];
    let creator_team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        creator_indexes,
        20,
    );
    let opponent_team = capture_team(
        &mut svm,
        &opponent,
        &capture_authority,
        game_config,
        &species,
        opponent_indexes,
        30,
    );
    let creator_species = creator_indexes.map(|index| species[index]);
    let opponent_species = opponent_indexes.map(|index| species[index]);
    let match_id = 41;
    let (open_instruction, match_account) =
        open_match_instruction(creator.pubkey(), game_config, match_id, creator_team);
    assert!(send_instruction(&mut svm, &creator, open_instruction));

    let opened = read_match(&svm, &match_account);
    assert_eq!(opened.match_id, match_id);
    assert_eq!(opened.creator, creator.pubkey());
    assert_eq!(opened.creator_creatures, creator_team);
    assert_eq!(opened.status, wildquest::state::MatchStatus::Open);
    assert_eq!(opened.opponent, None);
    let open_match_balance = svm.get_balance(&match_account).unwrap();
    let creator_before_join = svm.get_balance(&creator.pubkey()).unwrap();

    let join_instruction = join_match_instruction(
        opponent.pubkey(),
        creator.pubkey(),
        game_config,
        match_account,
        creator_team,
        opponent_team,
        creator_species,
        opponent_species,
    );
    assert!(send_instruction(
        &mut svm,
        &opponent,
        join_instruction.clone()
    ));

    let active = read_match(&svm, &match_account);
    assert_eq!(active.status, wildquest::state::MatchStatus::Active);
    assert_eq!(active.winner, None);
    let resolve = resolve_match_instruction(
        capture_authority.pubkey(),
        game_config,
        creator.pubkey(),
        opponent.pubkey(),
        match_account,
        Some(creator.pubkey()),
    );
    assert!(send_instruction(&mut svm, &capture_authority, resolve));
    let claimable = read_match(&svm, &match_account);
    assert_eq!(claimable.status, wildquest::state::MatchStatus::Claimable);
    assert_eq!(claimable.opponent, Some(opponent.pubkey()));
    assert_eq!(claimable.opponent_creatures, opponent_team);
    assert_eq!(claimable.winner, Some(creator.pubkey()));
    assert!(claimable.settled_at.is_some());
    assert_eq!(
        svm.get_balance(&creator.pubkey()).unwrap(),
        creator_before_join
    );
    assert_eq!(
        svm.get_balance(&match_account).unwrap(),
        open_match_balance + wildquest::constants::MATCH_STAKE_LAMPORTS
    );

    let escrow_balance = svm.get_balance(&match_account).unwrap();
    let creator_creature_before = svm.get_account(&creator_team[0]).unwrap();
    assert!(!send_instruction(&mut svm, &opponent, join_instruction));
    assert_eq!(svm.get_balance(&match_account).unwrap(), escrow_balance);
    assert_eq!(
        svm.get_account(&creator_team[0]).unwrap().data,
        creator_creature_before.data
    );
    assert_eq!(
        read_match(&svm, &match_account).winner,
        Some(creator.pubkey())
    );

    let wrong_claim = claim_match_payout_instruction(opponent.pubkey(), match_account);
    assert!(!send_instruction(&mut svm, &opponent, wrong_claim));
    assert_eq!(svm.get_balance(&match_account).unwrap(), escrow_balance);
    assert_eq!(
        read_match(&svm, &match_account).status,
        wildquest::state::MatchStatus::Claimable
    );

    let creator_before_claim = svm.get_balance(&creator.pubkey()).unwrap();
    let claim = claim_match_payout_instruction(creator.pubkey(), match_account);
    assert!(send_instruction(&mut svm, &creator, claim.clone()));
    assert_eq!(
        read_match(&svm, &match_account).status,
        wildquest::state::MatchStatus::Settled
    );
    assert_eq!(
        svm.get_balance(&match_account).unwrap(),
        open_match_balance - wildquest::constants::MATCH_STAKE_LAMPORTS
    );
    assert!(svm.get_balance(&creator.pubkey()).unwrap() > creator_before_claim);

    let settled_balance = svm.get_balance(&match_account).unwrap();
    assert!(!send_instruction(&mut svm, &creator, claim));
    assert_eq!(svm.get_balance(&match_account).unwrap(), settled_balance);
}

#[test]
fn test_match_tie_refunds_both_stakes() {
    let admin = Keypair::new();
    let creator = Keypair::new();
    let opponent = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &creator, &opponent] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }
    svm.airdrop(&capture_authority.pubkey(), 10_000_000)
        .unwrap();

    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let indexes = [0, 1, 2];
    let creator_team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        indexes,
        40,
    );
    let opponent_team = capture_team(
        &mut svm,
        &opponent,
        &capture_authority,
        game_config,
        &species,
        indexes,
        50,
    );
    let team_species = indexes.map(|index| species[index]);
    let (open_instruction, match_account) =
        open_match_instruction(creator.pubkey(), game_config, 42, creator_team);
    assert!(send_instruction(&mut svm, &creator, open_instruction));
    let creator_before_join = svm.get_balance(&creator.pubkey()).unwrap();
    let open_match_balance = svm.get_balance(&match_account).unwrap();

    let join_instruction = join_match_instruction(
        opponent.pubkey(),
        creator.pubkey(),
        game_config,
        match_account,
        creator_team,
        opponent_team,
        team_species,
        team_species,
    );
    assert!(send_instruction(&mut svm, &opponent, join_instruction));

    let resolve = resolve_match_instruction(
        capture_authority.pubkey(),
        game_config,
        creator.pubkey(),
        opponent.pubkey(),
        match_account,
        None,
    );
    assert!(send_instruction(&mut svm, &capture_authority, resolve));

    let settled = read_match(&svm, &match_account);
    assert_eq!(settled.status, wildquest::state::MatchStatus::Settled);
    assert_eq!(settled.winner, None);
    assert_eq!(
        svm.get_balance(&creator.pubkey()).unwrap(),
        creator_before_join + wildquest::constants::MATCH_STAKE_LAMPORTS
    );
    assert_eq!(
        svm.get_balance(&match_account).unwrap(),
        open_match_balance - wildquest::constants::MATCH_STAKE_LAMPORTS
    );
}

#[test]
fn test_active_match_refunds_after_expiry_and_cannot_resolve() {
    let admin = Keypair::new();
    let creator = Keypair::new();
    let opponent = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &creator, &opponent] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }
    svm.airdrop(&capture_authority.pubkey(), 10_000_000)
        .unwrap();

    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let creator_indexes = [0, 1, 2];
    let opponent_indexes = [3, 4, 5];
    let creator_team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        creator_indexes,
        130,
    );
    let opponent_team = capture_team(
        &mut svm,
        &opponent,
        &capture_authority,
        game_config,
        &species,
        opponent_indexes,
        140,
    );
    let (open, match_account) =
        open_match_instruction(creator.pubkey(), game_config, 57, creator_team);
    assert!(send_instruction(&mut svm, &creator, open));
    assert!(send_instruction(
        &mut svm,
        &opponent,
        join_match_instruction(
            opponent.pubkey(),
            creator.pubkey(),
            game_config,
            match_account,
            creator_team,
            opponent_team,
            creator_indexes.map(|index| species[index]),
            opponent_indexes.map(|index| species[index]),
        ),
    ));

    let active = read_match(&svm, &match_account);
    let expires_at = active.active_expires_at.unwrap();
    let early = refund_stale_match_instruction(
        creator.pubkey(),
        creator.pubkey(),
        opponent.pubkey(),
        match_account,
    );
    assert!(!send_instruction(&mut svm, &creator, early));
    let creator_before = svm.get_balance(&creator.pubkey()).unwrap();
    let opponent_before = svm.get_balance(&opponent.pubkey()).unwrap();

    let mut clock = svm.get_sysvar::<anchor_lang::prelude::Clock>();
    clock.unix_timestamp = expires_at + 1;
    svm.set_sysvar(&clock);
    let refund = refund_stale_match_instruction(
        opponent.pubkey(),
        creator.pubkey(),
        opponent.pubkey(),
        match_account,
    );
    assert!(send_instruction(&mut svm, &opponent, refund));
    assert_eq!(
        read_match(&svm, &match_account).status,
        wildquest::state::MatchStatus::Refunded
    );
    assert_eq!(
        svm.get_balance(&creator.pubkey()).unwrap(),
        creator_before + wildquest::constants::MATCH_STAKE_LAMPORTS
    );
    assert!(svm.get_balance(&opponent.pubkey()).unwrap() > opponent_before);
    let resolve = resolve_match_instruction(
        capture_authority.pubkey(),
        game_config,
        creator.pubkey(),
        opponent.pubkey(),
        match_account,
        Some(creator.pubkey()),
    );
    assert!(!send_instruction(&mut svm, &capture_authority, resolve));
}

#[test]
fn test_open_match_rejects_duplicate_and_foreign_creatures() {
    let admin = Keypair::new();
    let creator = Keypair::new();
    let other_owner = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &creator, &other_owner] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }

    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let creator_team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        [0, 1, 2],
        60,
    );
    let foreign = capture_team(
        &mut svm,
        &other_owner,
        &capture_authority,
        game_config,
        &species,
        [0, 1, 2],
        70,
    );

    let duplicate_team = [creator_team[0], creator_team[0], creator_team[2]];
    let (duplicate_instruction, duplicate_match) =
        open_match_instruction(creator.pubkey(), game_config, 43, duplicate_team);
    assert!(!send_instruction(&mut svm, &creator, duplicate_instruction));
    assert!(svm.get_account(&duplicate_match).is_none());

    let foreign_team = [creator_team[0], foreign[1], creator_team[2]];
    let (foreign_instruction, foreign_match) =
        open_match_instruction(creator.pubkey(), game_config, 44, foreign_team);
    assert!(!send_instruction(&mut svm, &creator, foreign_instruction));
    assert!(svm.get_account(&foreign_match).is_none());
}

#[test]
fn test_cancel_match_refunds_stake_and_rejects_wrong_creator() {
    let admin = Keypair::new();
    let creator = Keypair::new();
    let wrong_creator = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &creator, &wrong_creator] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }

    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        [0, 1, 2],
        80,
    );
    let (open_instruction, match_account) =
        open_match_instruction(creator.pubkey(), game_config, 45, team);
    assert!(send_instruction(&mut svm, &creator, open_instruction));
    let open_match_balance = svm.get_balance(&match_account).unwrap();

    let wrong_cancel = cancel_match_instruction(wrong_creator.pubkey(), match_account);
    assert!(!send_instruction(&mut svm, &wrong_creator, wrong_cancel));
    assert_eq!(
        read_match(&svm, &match_account).status,
        wildquest::state::MatchStatus::Open
    );

    let cancel = cancel_match_instruction(creator.pubkey(), match_account);
    assert!(send_instruction(&mut svm, &creator, cancel.clone()));
    assert_eq!(
        read_match(&svm, &match_account).status,
        wildquest::state::MatchStatus::Cancelled
    );
    assert_eq!(
        svm.get_balance(&match_account).unwrap(),
        open_match_balance - wildquest::constants::MATCH_STAKE_LAMPORTS
    );

    let cancelled_balance = svm.get_balance(&match_account).unwrap();
    assert!(!send_instruction(&mut svm, &creator, cancel));
    assert_eq!(svm.get_balance(&match_account).unwrap(), cancelled_balance);
}

#[test]
fn test_owner_releases_and_recaptures_creature() {
    let admin = Keypair::new();
    let owner = Keypair::new();
    let wrong_owner = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &owner, &wrong_owner] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }
    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species_config = initialize_species_config(
        &mut svm,
        &admin,
        game_config,
        wildquest::constants::BATTLE_CATALOGUE_IDS[0],
    );
    let creature = capture_creature(
        &mut svm,
        &owner,
        &capture_authority,
        game_config,
        species_config,
        wildquest::constants::BATTLE_CATALOGUE_IDS[0],
        91,
    );
    let owner_before_release = svm.get_balance(&owner.pubkey()).unwrap();

    let wrong_release = release_creature_instruction(wrong_owner.pubkey(), creature);
    assert!(!send_instruction(&mut svm, &wrong_owner, wrong_release));
    assert!(svm.get_account(&creature).is_some());

    let release = release_creature_instruction(owner.pubkey(), creature);
    assert!(send_instruction(&mut svm, &owner, release));
    assert!(svm.get_account(&creature).is_none());
    assert!(svm.get_balance(&owner.pubkey()).unwrap() > owner_before_release);

    let recaptured = capture_creature(
        &mut svm,
        &owner,
        &capture_authority,
        game_config,
        species_config,
        wildquest::constants::BATTLE_CATALOGUE_IDS[0],
        92,
    );
    assert_eq!(recaptured, creature);
    assert!(svm.get_account(&creature).is_some());
}

#[test]
fn test_admin_reset_closes_creature_and_refunds_open_match() {
    let admin = Keypair::new();
    let wrong_admin = Keypair::new();
    let creator = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &wrong_admin, &creator] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }
    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        [0, 1, 2],
        100,
    );
    let (open_instruction, match_account) =
        open_match_instruction(creator.pubkey(), game_config, 55, team);
    assert!(send_instruction(&mut svm, &creator, open_instruction));
    let creator_before_reset = svm.get_balance(&creator.pubkey()).unwrap();

    let wrong_reset = admin_close_match_instruction(
        wrong_admin.pubkey(),
        game_config,
        match_account,
        creator.pubkey(),
        creator.pubkey(),
    );
    assert!(!send_instruction(&mut svm, &wrong_admin, wrong_reset));
    assert!(svm.get_account(&match_account).is_some());

    let reset_match = admin_close_match_instruction(
        admin.pubkey(),
        game_config,
        match_account,
        creator.pubkey(),
        creator.pubkey(),
    );
    assert!(send_instruction(&mut svm, &admin, reset_match));
    assert!(svm.get_account(&match_account).is_none());
    assert!(svm.get_balance(&creator.pubkey()).unwrap() > creator_before_reset);

    let reset_creature =
        admin_close_creature_instruction(admin.pubkey(), game_config, team[0], creator.pubkey());
    assert!(send_instruction(&mut svm, &admin, reset_creature));
    assert!(svm.get_account(&team[0]).is_none());
}

#[test]
fn test_admin_reset_pays_claimable_match_winner() {
    let admin = Keypair::new();
    let creator = Keypair::new();
    let opponent = Keypair::new();
    let capture_authority = Keypair::new();
    let mut svm = create_test_svm();
    for wallet in [&admin, &creator, &opponent] {
        svm.airdrop(&wallet.pubkey(), 2_000_000_000).unwrap();
    }
    svm.airdrop(&capture_authority.pubkey(), 10_000_000)
        .unwrap();
    let game_config = initialize_game_config(&mut svm, &admin, capture_authority.pubkey());
    let species = initialize_battle_configs(&mut svm, &admin, game_config);
    let creator_indexes = [1, 2, 4];
    let opponent_indexes = [5, 0, 3];
    let creator_team = capture_team(
        &mut svm,
        &creator,
        &capture_authority,
        game_config,
        &species,
        creator_indexes,
        110,
    );
    let opponent_team = capture_team(
        &mut svm,
        &opponent,
        &capture_authority,
        game_config,
        &species,
        opponent_indexes,
        120,
    );
    let (open_instruction, match_account) =
        open_match_instruction(creator.pubkey(), game_config, 56, creator_team);
    assert!(send_instruction(&mut svm, &creator, open_instruction));
    let join = join_match_instruction(
        opponent.pubkey(),
        creator.pubkey(),
        game_config,
        match_account,
        creator_team,
        opponent_team,
        creator_indexes.map(|index| species[index]),
        opponent_indexes.map(|index| species[index]),
    );
    assert!(send_instruction(&mut svm, &opponent, join));
    let resolve = resolve_match_instruction(
        capture_authority.pubkey(),
        game_config,
        creator.pubkey(),
        opponent.pubkey(),
        match_account,
        Some(creator.pubkey()),
    );
    assert!(send_instruction(&mut svm, &capture_authority, resolve));
    assert_eq!(
        read_match(&svm, &match_account).winner,
        Some(creator.pubkey())
    );
    let creator_before_reset = svm.get_balance(&creator.pubkey()).unwrap();
    let opponent_before_reset = svm.get_balance(&opponent.pubkey()).unwrap();

    let wrong_recipient = admin_close_match_instruction(
        admin.pubkey(),
        game_config,
        match_account,
        creator.pubkey(),
        opponent.pubkey(),
    );
    assert!(!send_instruction(&mut svm, &admin, wrong_recipient));
    assert!(svm.get_account(&match_account).is_some());
    assert_eq!(
        svm.get_balance(&opponent.pubkey()).unwrap(),
        opponent_before_reset
    );

    let reset = admin_close_match_instruction(
        admin.pubkey(),
        game_config,
        match_account,
        creator.pubkey(),
        creator.pubkey(),
    );
    assert!(send_instruction(&mut svm, &admin, reset));
    assert!(svm.get_account(&match_account).is_none());
    assert!(
        svm.get_balance(&creator.pubkey()).unwrap()
            > creator_before_reset + wildquest::constants::MATCH_STAKE_LAMPORTS
    );
}
