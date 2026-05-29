# ZBR Dashboard

The official web-based management platform for **ZBR**, a scripting language for Discord bots.

## Overview

ZBR is a scripting language for Discord bots powered by a high-performance Rust runtime engine.<br>
You write commands as plain `.zbr` files using ZBR functions, no boilerplate, no event handlers, no framework knowledge required.

This repository provides the central dashboard platform for ZBR, offering a high-performance web interface for managing your Discord bot fleet, creating and editing commands, managing variables, and monitoring bot status.

## Key Features

- **Visual Script Editor**: A full-featured code editor powered by Monaco, with custom syntax highlighting, autocomplete, and snippets for all ZBR functions.
- **Fleet Management**: Unified interface to manage multiple bots. Monitor status, command counts, and variable distributions across your entire ecosystem.
- **Dynamic Configuration**: Real-time management of bot activities, status states, and logging preferences without manual config file edits.
- **Variable Management**: Centralized CRUD interface for bot-specific variables, allowing for rapid state management and persistence.
- **Command Management**: Organize bot interactions through a specialized UI supporting prefix, slash, event, and interaction-based commands.
- **Secure Integration**: Hardened authentication via Discord OAuth2 and encrypted storage for sensitive bot tokens using AES-256-CBC.
- **Data Portability**: Integrated import and export functionality for full project mobility and backup management.

## Project Structure

- `src/app/`: Next.js App Router for the dashboard and authentication pages.
- `src/app/api/`: Serverless API routes for Firestore operations and Discord integration.
- `src/components/`: Reusable UI components including the ZBR editor and navigation.
- `src/lib/`: Core utilities for authentication, database access, and ZBR function metadata.
- `public/`: Static assets including the ZBR branding and icons.

## License

All Rights Reserved, see [LICENSE](LICENSE).
