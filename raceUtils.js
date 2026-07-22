import {
    getParticipants
} from "./state.js";

/*
==================================================
STATI GARA UFFICIALI
==================================================
*/

export const RACE_STATUS = {
    PREPARED: "prepared",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    ARCHIVED: "archived"
};

/*
==================================================
CALCOLO STATO GARA
==================================================

Lo stato viene determinato dai punteggi inseriti.

L'unica eccezione è "archived", che viene
impostato manualmente e deve essere mantenuto.
*/

export function getRaceStatus(
    race
) {
    if (!race) {
        return RACE_STATUS.PREPARED;
    }

    if (
        race.status ===
        RACE_STATUS.ARCHIVED
    ) {
        return RACE_STATUS.ARCHIVED;
    }

    const participants =
        getParticipants(
            race
        );

    if (
        participants.length === 0
    ) {
        return RACE_STATUS.PREPARED;
    }

    const completedCount =
        participants.filter(
            (participant) =>
                participant.status ===
                "completed"
        ).length;

    if (
        completedCount === 0
    ) {
        return RACE_STATUS.PREPARED;
    }

    if (
        completedCount ===
        participants.length
    ) {
        return RACE_STATUS.COMPLETED;
    }

    return RACE_STATUS.IN_PROGRESS;
}

/*
==================================================
AGGIORNAMENTO STATO SALVATO
==================================================
*/

export function updateRaceStatus(
    race
) {
    if (!race) {
        return RACE_STATUS.PREPARED;
    }

    const status =
        getRaceStatus(
            race
        );

    race.status =
        status;

    return status;
}

/*
==================================================
INFORMAZIONI GRAFICHE
==================================================
*/

export function getRaceStatusInfo(
    race
) {
    const status =
        getRaceStatus(
            race
        );

    const statusInfo = {
        [RACE_STATUS.PREPARED]: {
            key: RACE_STATUS.PREPARED,
            label: "Preparata",
            icon: "🟢"
        },

        [RACE_STATUS.IN_PROGRESS]: {
            key: RACE_STATUS.IN_PROGRESS,
            label: "In corso",
            icon: "🟡"
        },

        [RACE_STATUS.COMPLETED]: {
            key: RACE_STATUS.COMPLETED,
            label: "Conclusa",
            icon: "✅"
        },

        [RACE_STATUS.ARCHIVED]: {
            key: RACE_STATUS.ARCHIVED,
            label: "Archiviata",
            icon: "📦"
        }
    };

    return statusInfo[
        status
    ];
}

/*
==================================================
ARCHIVIAZIONE
==================================================
*/

export function archiveRace(
    race
) {
    if (!race) {
        return;
    }

    race.status =
        RACE_STATUS.ARCHIVED;

    race.updatedAt =
        new Date().toISOString();
}

export function restoreRace(
    race
) {
    if (!race) {
        return;
    }

    race.status =
        RACE_STATUS.PREPARED;

    updateRaceStatus(
        race
    );

    race.updatedAt =
        new Date().toISOString();
}