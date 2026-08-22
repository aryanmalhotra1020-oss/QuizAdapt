class BKTModel:
    
    def __init__(self, p_know=0.5, p_learn=0.2, p_guess=0.25, p_slip=0.1):
        self.p_know = p_know
        self.p_learn = p_learn
        self.p_guess = p_guess
        self.p_slip = p_slip

    def update(self, p_know, correct):
        """
        Update knowledge probability after an answer.
        This is the core BKT online learning step —
        called after every single answer to update in real time.
        """
        if correct:
            # P(know | correct answer)
            p_correct_given_know = 1 - self.p_slip
            p_correct_given_not_know = self.p_guess
        else:
            # P(know | incorrect answer)
            p_correct_given_know = self.p_slip
            p_correct_given_not_know = 1 - self.p_guess

        # Bayes update
        numerator = p_correct_given_know * p_know
        denominator = numerator + p_correct_given_not_know * (1 - p_know)
        p_know_given_obs = numerator / denominator if denominator > 0 else p_know

        # Learning update — account for chance of learning after attempt
        p_know_updated = p_know_given_obs + (1 - p_know_given_obs) * self.p_learn

        return round(p_know_updated, 4)

    def classify(self, strength_score):
        """
        Classify a topic as strong or weak based on knowledge score.
        """
        if strength_score >= 0.7:
            return 'strong'
        elif strength_score >= 0.4:
            return 'moderate'
        else:
            return 'weak'