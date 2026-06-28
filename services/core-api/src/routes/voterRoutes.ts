import express from "express";
import { logout } from "../controllers/authControllers/logout.js";
import { VoterLogin } from "../controllers/authControllers/VoterLogin.js";
import { ActivateVoterAccount } from "../controllers/authControllers/ActivateVoterAccount.js";
import { GetVoterElection } from "../controllers/electionControllers/GetVotersElection.js";
import { GetCandidateInElectionMobileSide } from "../controllers/electionControllers/GetCandidateInElectionMobileSide.js";
import { GetSingleCandidateDetails } from "../controllers/electionControllers/GetSingleCandidateDetails.js";
import { CastVote } from "../controllers/electionControllers/CastVote.js";
import { getMeVoter } from "../controllers/ManageUser/GetMeVoter.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { VerifyBiometric } from "../controllers/electionControllers/VerifyBiometric.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();
router.post("/voterLogin", VoterLogin);
router.post("/logout", logout);
router.post("/activateVoterAccount", ActivateVoterAccount);
router.get("/elections", GetVoterElection);
router.get("/candidates/:electionId", GetCandidateInElectionMobileSide);
router.get("/elections/:electionId/candidates/:candidateId", GetSingleCandidateDetails);
router.post("/castVote/:candidateId", protectRoute, CastVote);
router.get("/getMeVoter", protectRoute, getMeVoter);
router.post("/verify-biometric", protectRoute, upload.single("image"), VerifyBiometric);

export default router;
