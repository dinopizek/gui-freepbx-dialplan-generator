# FreePBX Dialplan Generator Web

A web-based tool for generating FreePBX dialplan configurations. This application provides a user-friendly interface to generate and download dialplan configurations in CSV format.

## Features

- Web-based interface for easy configuration
- Real-time preview of generated dialplan
- CSV download functionality
- Docker support for easy deployment
- Responsive design for all devices

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd freepbx-dialplan-generator-web
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application at `http://localhost:3000`

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Usage

1. Enter the **minimum prefix** (e.g., 540) — this is the exact starting prefix you want.
2. Enter the **maximum prefix** (e.g., 544) or use the **range** option to specify the number of prefixes.
3. Click "Generate Dialplan".
4. Preview the generated configuration.
5. Click "Download CSV" to save the configuration.

## Example Use Case

A telecom operator assigns SIM cards based on specific prefixes:

| Prefix | Phone Number  | SIM Assignment |
|--------|--------------|---------------|
| 541    | 098 1231231  | SIM 1         |
| 542    | 098 1231232  | SIM 2         |
| 543    | 098 1231233  | SIM 3         |
| 544    | 098 1231234  | SIM 4         |

To generate dialplan rules for these, enter **541** as the minimum prefix and **544** as the maximum prefix (or use range 4 starting from 541).

## Docker Commands

- Start the application: `docker-compose up -d`
- Stop the application: `docker-compose down`
- View logs: `docker-compose logs -f`
- Rebuild the application: `docker-compose up -d --build`

## License

MIT
