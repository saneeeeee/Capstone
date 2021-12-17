const Election = artifacts.require('./Election.sol')

contract("Election", accounts => {

    it('후보자 3 명 등록하면 candidatesCount는 3명 이다.', () => {
        return Election.deployed()
            .then(instance => {
                // 3명의 후보자를 등록합니다.
                instance.addCandidate('ahnsj')
                instance.addCandidate('shl')
                instance.addCandidate('lgs')
                
                // candidatesCount를 반환한다.
                return instance.candidatesCount()
            })
            .then(count => {
                // count는 3 다.
                assert.equal(count, 3)
            })
    })

    it('후보자 정보를 검증한다.', () => {
        return Election.deployed()
            .then(instance => {
                electionInstance = instance
                
                // 첫번째 후보자를 반환한다.
                // 이미 3 명의 후보자가 등록되어 있음
                return electionInstance.candidates(1)
            })
            .then(candidate => {
                assert.equal(candidate[0], 1, '1 번째 후보자 기호는 1번 이다.')
                assert.equal(candidate[1], 'asj', '첫번째 후보자 이름은 asj 이다.')
                assert.equal(candidate[2], 0, '1 번째 후보자 득표는 0 이다.')
                
                // 두번째 후보자를 반환한다.
                return electionInstance.candidates(2)
            })
            .then(candidate => {
                assert.equal(candidate[0], 2, '2 번째 후보자 기호는 2번 이다.')
                assert.equal(candidate[1], 'shl', '두번째 후보자 이름은 shl 이다.')
                assert.equal(candidate[2], 0, '2 번째 후보자 득표는 0 이다.')

                return electionInstance.candidates(3)
            })
            .then(candidate => {
                assert.equal(candidate[0], 3, '3 번째 후보자 기호는 3번 이다.')
                assert.equal(candidate[1], 'lgs', '두번째 후보자 이름은 lgs 이다.')
                assert.equal(candidate[2], 0, '3 번째 후보자 득표는 0 이다.')
            })
    })


    it('투표하기', () => {
        return Election.deployed()
            .then(instance => {
                electionInstance = instance
                candidateId = 1
                
                // 1번 후보자에게 1번째 계정으로 투표한다.
                return electionInstance.vote(candidateId, {from: accounts[1]})
            })
            .then(() => {
                // voters 데이터의 account[1] 계정 주소를 반환함
                return electionInstance.voters(accounts[1])
            })
            .then(voted => {
                assert(voted, 'account[1]의 계정 주소가 투표한 것을 확인한다.')
                
                // 1번 후보자를 반환함
                return electionInstance.candidates(candidateId)
            })
            .then(candidate => {
                const voteCount = candidate.voteCount.toNumber()
                assert(voteCount, 1, '1번 후보자의 득표는 1 이다.')
            })
    })

    
    it('투표 유효성 검사', () => {
        return Election.deployed()
            .then(instance => {
                electionInstance = instance
                
                // 유효하지 않은 후보자에게 투표한다.
                return electionInstance.vote(99, {from: accounts[0]})
            })
            .then(assert.fail)
            .catch(error => {
                assert(error.message.indexOf('revert') >= 0, '유효하지 않은 후보자에게 투표하면 exception이 발생해야 한다.')
                
                // 1번 후보자를 반환한다.
                return electionInstance.candidates(1) 
            })
            .then(candidate1 => {
                const voteCount = candidate1.voteCount.toNumber()
                assert.equal(voteCount, 1, 'exception 발생 이후 1번 후보자의 득표는 여전히 1 이어야 한다.')
                
                // 2번 후보자를 반환한다.
                return electionInstance.candidates(2)
            })
            .then(candidate2 => {
                const voteCount = candidate2.voteCount.toNumber()
                assert.equal(voteCount, 0, '2번 후보자의 득표수는 0이다.')

                // 3번 후보자를 반환한다.
                return electionInstance.candidates(3)
            })
            .then(candidate3 => {
                const voteCount = candidate3.voteCount.toNumber()
                assert.equal(voteCount, 0, '3번 후보자의 득표수는 0이다.')
            })
    })


    it('중복 투표를 방지한다.', () => {
        return Election.deployed()
            .then(instance => {
                electionInstance = instance
                candidateId = 2

                // 2번 후보자에게 2번째 계정으로 투표한다.               
                return electionInstance.vote(candidateId, {from: accounts[2]})
            })
            .then(() => {
                return electionInstance.voters(accounts[2])
            })
            .then(voted => {
                assert(voted, 'account[2] voted')

                // 2번 후보자를 반환한다.
                return electionInstance.candidates(2)
            })  
            .then(candidate2 => {
                const voteCount = candidate2.voteCount.toNumber()
                assert.equal(voteCount, 1, '첫 번째 투표는 정상적으로 작동해야한다.')

                // 같은 후보자에게 같은 계정으로 다시 투표한다.
                return electionInstance.vote(candidateId, {from: accounts[2]})
            })
            .then(assert.fail)
            .catch(error => {
                assert(error.message, '같은 게정으로 투표할 수 없어야 한다.')
                
                // 2번 후보자를 반환한다.
                return electionInstance.candidates(2)
            })
            .then(candidate2 => {
                const voteCount = candidate2.voteCount.toNumber()
                assert.equal(voteCount, 1, '2번 후보자는 득표는 1 이 유지되고 있음.')
                
                // 1번 후보자를 반환한다.
                return electionInstance.candidates(1)
            })
            .then(candidate1 => {
                const voteCount = candidate1.voteCount.toNumber()
                assert.equal(voteCount, 1, '1번 후보자의 득표는 1 이 유지되고 있음.')

                // 3번 후보자를 반환한다.
                return electionInstance.candidates(3)
            })
            .then(candidate3 => {
                const voteCount = candidate3.voteCount.toNumber()
                assert.equal(voteCount, 0, '3번 후보자의 득표수는 0이다.')
            })
    })



})