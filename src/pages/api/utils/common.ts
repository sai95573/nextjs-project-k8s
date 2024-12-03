

export function getSleepScoreTag(sleepScore) {
    if (sleepScore >= 90) return "Excellent";
    if (sleepScore >= 75) return "Good";
    if (sleepScore >= 60) return "Average";
    return "Poor";
}


export function getHeartRateTag(avgHeartRate) {
    if (avgHeartRate < 60) {
        return "Low";
    } else if (avgHeartRate >= 60 && avgHeartRate <= 100) {
        return "Normal";
    } else {
        return "High";
    }
}


export function getRespirationRateTag(avgBreathRate, gender) {
    if (gender === "Male") {
        if (avgBreathRate < 10) {
            return "Low";
        } else if (avgBreathRate >= 10 && avgBreathRate <= 20) {
            return "Normal";
        } else {
            return "High";
        }
    } else {
        if (avgBreathRate < 12) {
            return "Low";
        } else if (avgBreathRate >= 12 && avgBreathRate <= 22) {
            return "Normal";
        } else {
            return "High";
        }
    }
}

export function getEmancipateOneSelfTag(turnOverTimes) {
    if (turnOverTimes < 20) {
        return "Normal";
    } else {
        return "Excessive";
    }

}

export function getSleepDurationTag(averageSleepDuration) {
    if (averageSleepDuration < 6) {
        return "Sleep-Deprived";
    } else if (averageSleepDuration >= 6 && averageSleepDuration <= 9) {
        return "Adequate";
    } else {
        return "Excessive";
    }
}

export function getSleepEffectivenessTag(averageSleepEfficiency) {
    if (averageSleepEfficiency < 75) {
        return "Low";
    } else if (averageSleepEfficiency >= 75 && averageSleepEfficiency < 85) {
        return "Average";
    } else {
        return "Good";
    }
}

export function getSleepRegularityTag(recordCount) {
    if (recordCount > 180) {
        return "Irregular";
    } else {
        return "Regular";
    }
}

export function getSleepInterruptionTag(leaveBedTimeArray) {
    if (leaveBedTimeArray >= 2) {
        return "Excessive";
    } else {
        return "Normal";
    }
}

export function getApena(apena) {
    if (apena < 5) {
        return "No Risk";
    } else if (apena >= 5 && apena < 15) {
        return "Low Risk";
    } else if (apena >= 15 && apena < 30) {
        return "Medium Risk";
    } else {
        return "High Risk";
    }
}
