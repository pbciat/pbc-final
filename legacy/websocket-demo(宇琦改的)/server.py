import asyncio
import websockets
import json

# Helpers
def str2bool(sting):
    return sting.lower() in ("yes", "true", "t", "1")


# stimulus obj
class Stim():
    def __init__(self, content, answer='left', block=1):
        """
        content: str. Either a file path for image stimuls or 
                 a string for text stiulus.
        answer: str. 'left' or 'right'. Should the subject press
                the key `e` ('left') or the key `i` ('right') to 
                answer the question correctly.
        block: int. 1 to 5, the experimental condition the stimulus
               belongs to.
        """
        self.content = content
        self.answer = answer
        self.block = int(block)
        self.type = 'img' if content.endswith('.png') else 'text'
        self.rt = None
        self.correct = None

    def __str__(self):
        return "content: %s\nanswer: %s\nblock: %1d\ntype: %s\nrt: %s\ncorrect: %s" % \
               (self.content, self.answer, self.block, self.type, self.rt, self.correct)
    
    def toJSON(self):
        stim_dict = {'content': self.content,
                    'answer': self.answer,
                    'block': str(self.block),
                     'type': self.type}
        return json.dumps(stim_dict)

terms = [' ','左手食指放在 E 鍵上 右手食指放在 I 鍵上<br>按「空白鍵」開始', '真誠', '吳敦義', '厭惡', '蔡英文', '結束囉～']
answers = ['dontmatter','dontmatter', 'left', 'right', 'right', 'left', 'dontmatter']
stim_lst = [Stim(term, ans, 3) for term, ans in zip(terms, answers)]

# Websockets server function
async def experiment(websocket, path):
    for i in range(len(stim_lst)):
        # Send stimulus to client
        sending = stim_lst[i]
        await websocket.send(sending.toJSON())
        ##print('Sent to client:\n', sending, sep='')
        
        # Receive repsonse from client
        res = await websocket.recv()
        msg = json.loads(res)
        sending.rt = float(msg['rt'])
        sending.correct = str2bool(msg['correct'])
        stim_lst[i] = sending  # Save received result
        ##print('Received from client:\n', sending, '\n', sep='')

        # hold for 0.8sec before next round
        await asyncio.sleep(0.8)
        
        # Print final result after receiving the last trial
        if i == len(stim_lst) - 2:
            print('Printing results ...')
            for stim in stim_lst:
                print(stim)
                print()

start_server = websockets.serve(experiment, 'localhost', 8765)        


asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
