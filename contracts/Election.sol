pragma solidity 0.5.16;

contract Election {

    // 후보자 모델
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // 후보자 기호 변수
    uint public candidatesCount;

    // constructor
    constructor() public {
        addCandidate('asj');
        addCandidate('shl');
        addCandidate('lgs');
    }

    // 후보자 반환하기
    mapping(uint => Candidate) public candidates;

    // 후보자 등록하기
    function addCandidate (string memory _name) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // vote function start

    // 투표에 참여한 ID 기록
    mapping(address => bool) public voters;

    // 투표하기
    function vote(uint _candidateId) public {
        // 투표에 참여한 ID를 기록해서 두번 투표하지 못하도록 한다.
        // voters[msg.sender] = true;

        // 중복투표를 하면 오류를 발생 시킨다.
        require(!voters[msg.sender]);

        // 목록에 없는 후보자에게 투표하면 오류를 발생시킨다.
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // 투표에 참여한 ID를 기록해서 두번 투표하지 못하도록 한다.
        voters[msg.sender] = true;

        // 득표수를 +1 한다.
        candidates[_candidateId].voteCount ++;
    }

    // vote function end
    
}