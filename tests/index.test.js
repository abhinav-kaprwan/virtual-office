import axios from "axios";

const API_URL = "http://localhost:3000";  // Eventually will change it 

const WS_URL = "ws://localhost:3001"; // Eventually will change it

describe("Authentication endpoint",()=>{
    test('Unique user should able to sign up only once ',async ()=>{
        // first time user
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const response = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        expect(response.status).toBe(200)
        // Same user should not be able to sign up again

        const updatedResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        expect(updatedResponse.status).toBe(400)
    })

    test('Signup request should fail if username is not provided', async ()=>{
        const username = "random";
        const password  = "testpassword";
        const response = await axios.post(`${API_URL}/api/v1/signup`,
            {
                password,
                type:"admin"
            })
        expect(response.status).toBe(400);
    })

    test('Signup request should fail if password is not provided', async ()=>{
        const username = "random";
        const password  = "testpassword";
        const response = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                type:"admin"
            })
        expect(response.status).toBe(400);
    })

    test('Signin success with correct credentials',async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        const signinResponse = await axios.post(`${API_URL}/api/v1/signin`,
            {
                username,
                password
            })
        expect(signinResponse.status).toBe(200)
        expect(signinResponse.data.token).toBeDefined()
    })

    test('Signin failure with incorrect credentials',async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        const signinResponse = await axios.post(`${API_URL}/api/v1/signin`,
            {
                username,
                password:"wrongpassword"
            })
        expect(signinResponse.status).toBe(403);
    })
})

describe("User metadata endpoint", ()=>{
    let token = "";
    let avatarId = "";
    //Authetication is needed for all tests
    beforeAll(async ()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
           
        const response = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })
        token = response.data.token;

        const avatarResponse = await axios.post(`${API_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "John"
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        
        avatarId = avatarResponse.data.avatarId;
    })

    test("User can't update their metadata with wrong avatar id", async()=>{
        const response = await axios.post(`${API_URL}/api/v1/user/`,{
            avatarId:"123232334"
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        expect(response.status).toBe(400)
    })

    test("User can update their metadata with right id",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/user/`,{
            avatarId: avatarId
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        expect(response.status).toBe(200)
    })

    test("User can't update their metadata because auth header is not present",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/user/`,{
            avatarId: avatarId
        })
        expect(response.status).toBe(403)
    })
})

describe("User avatar information endpoint",()=>{
    let avatarId;
    let token;
    let userId;

    beforeAll(async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const signUpResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        userId = signUpResponse.data.userId;
        const response = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })
        token = response.data.token;

        const avatarResponse = await axios.post(`${API_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "John"
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        
        avatarId = avatarResponse.data.avatarId;
    })

    test("Get avatar information for the user",async()=>{
        const response = await axios.get(`${API_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
        })

    test("Available avatr should list the recently created avatar",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(y=>y.avatarId ==avatarId)
        expect(currentAvatar).toBeDefined();
    })
})

describe("Space information endpoint",()=>{
    let mapId;
    let element1Id;
    let element2Id;
    let element3Id;
    let adminId;
    let adminToken;
    let userId;
    let userToken;

    beforeAll(async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const signUpResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })

        adminId = signUpResponse.data.userId;

        const response = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${API_URL}/api/v1/signup`,{
            username: username + "user",
            password: "testpassword",
            type:"user"
        })

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${API_URL}/api/v1/signin`,{    
            username: username + "user",
            password: "testpassword"
        })

        userToken = userSigninResponse.data.token;

        const element1Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })

        const element2Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })

        const element3Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })

        element1Id=element1Response.data.id;
        element2Id=element2Response.data.id;
        element3Id=element3Response.data.id;

        const mapResponse = axios.post(`${API_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element3Id,
                    x: 19,
                    y: 20
                }
            ]
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })

        mapId = mapResponse.data.id;
    })

    test("User should be able to create a space",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId,
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(200);
        expect(response.data.spaceId).toBeDefined();
    })

    test("User should be able to create a space without mapId",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(200);
        expect(response.data.spaceId).toBeDefined();
    })

    test("User should not be able to create a space without mapId and dimensions",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400);
    })

    test("User is not able to delete a space that doesn't exist",async()=>{
        const response = await axios.delete(`${API_URL}/api/v1/space/randomSpaceId`,
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400);
    })

    test("User should be able to delete a space that does exist",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        const deleteResponse = await axios.delete(`${API_URL}/api/v1/space/${response.data.spaceId}`,
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(deleteResponse.status).toBe(200);
    })

    test("User should not be able to delete space created by another user", async()=>{
        const response = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        const deleteResponse = await axios.delete(`${API_URL}/api/v1/space/${response.data.spaceId}`,
        {
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(deleteResponse.status).toBe(403);//Unauthorized to delete someone else's space
    })

    test("Admin has no spaces initially. So getting spaces for admin should return empty array", async()=>{
        const response = await axios.get(`${API_URL}/api/v1/space/all`)
        expect(response.data.spaces.length).toBe(0);
    })

    test("Admin has created one space", async()=>{
        const spaceCreateResponse = await axios.post(`${API_URL}/api/v1/space`,
            { 
                "name": "Test",
                "dimensions": "100x200",
                "mapId": "map1"
            },
            {
                headers:{
                    Authorization: `Bearer ${adminToken}`
                }
            });

            const response = await axios.get(`${API_URL}/api/v1/space/all`,{
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            })
            const filteredResponse = response.data.spaces.filter(x=>x.id == spaceCreateResponse.data.spaceId);
            expect(response.data.spaces.length).toBe(1);
            expect(filteredResponse).toBeDefined();
    })
})

describe("Arena Endpoint",()=>{
    let mapId;
    let element1Id;
    let element2Id;
    let element3Id;
    let adminId;
    let adminToken;
    let userId;
    let userToken;
    let spaceId;

    beforeAll(async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const signUpResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })

        adminId = signUpResponse.data.userId;

        const response = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${API_URL}/api/v1/signup`,{
            username: username + "user",
            password: "testpassword",
            type:"user"
        })

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${API_URL}/api/v1/signin`,{    
            username: username + "user",
            password: "testpassword"
        })

        userToken = userSigninResponse.data.token;

        const element1Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element3Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        element1Id=element1Response.data.id;
        element2Id=element2Response.data.id;
        element3Id=element3Response.data.id;

        const mapResponse = axios.post(`${API_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element3Id,
                    x: 19,
                    y: 20
                }
            ]
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId,
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.data.spaceId;
    })

    test("Incorrect space id ",async()=>{
        const response = await axios.get(`${API_URL}/api/v1/space/randomSpaceId`,{
            headers:{
                Authorization: `Bearer ${userToken}`
        }});
        expect(response.status).toBe(400);
    })

    test("Correct space id ",async()=>{
        const response = await axios.get(`${API_URL}/api/v1/space/${spaceId}`,{
            headers:{
                Authorization: `Bearer ${userToken}`
        }});
        expect(response.status).toBe(200);
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(3);
    })

    test("Delete endpoint should delete the element ",async()=>{
        const response = await axios.get(`${API_URL}/api/v1/space/${spaceId}`,{
            headers:{
                Authorization: `Bearer ${userToken}`
        }});

        await axios.delete(`${API_URL}/api/v1/space/element`,{
            id:response.data.elements[0].id
        },{
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        const updatedResponse = await axios.get(`${API_URL}/api/v1/space/${spaceId}`,{
            headers:{
                Authorization: `Bearer ${userToken}`
        }});
        
        expect(updatedResponse.data.elements.length).toBe(2);
    })

    test("Add an element to the space out of its dimensions",async()=>{
        const repsonse = await axios.post(`${API_URL}/ /api/v1/space/element`,{
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 120,
            "y": 290
        },{
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(repsonse.status).toBe(400);
    })

    test("Add an element to the space and work as expected",async()=>{
        await axios.post(`${API_URL}/ /api/v1/space/element`,{
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
        },{
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        const response = await axios.post(`${API_URL}/ /api/v1/space/${spaceId}`)
        expect(response.data.elements.length).toBe(3);
    })
})

//Admnin endpoints

describe("Admin Endpoints",()=>{
    let adminId;
    let adminToken;
    let userId;
    let userToken;

    beforeAll(async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const signUpResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })

        adminId = signUpResponse.data.userId;

        const response = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${API_URL}/api/v1/signup`,{
            username: username + "user",
            password: "testpassword",
            type:"user"
        })

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${API_URL}/api/v1/signin`,{    
            username: username + "user",
            password: "testpassword"
        })

        userToken = userSigninResponse.data.token;

        
    })

    test("User is not able to hit admin endpoint",async()=>{
        const elementResponse = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        const mapResponse = axios.post(`${API_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "random map",
            "defaultElements": []
        },{
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        const createAvatarResponse = await axios.post(`${API_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Don"
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })
        
        const updateElementResponse = await axios.put(`${API_URL}//api/v1/admin/element/random`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        },{
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(createAvatarResponse.status).toBe(403);
        expect(elementResponse.status).toBe(403);
        expect(mapResponse.status).toBe(403);
        expect(updateElementResponse.status).toBe(403);
    })

    test("Admin is able to hit admin endpoint",async()=>{
        const elementResponse = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        const mapResponse = axios.post(`${API_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "random map",
            "defaultElements": []
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        const createAvatarResponse = await axios.post(`${API_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Don"
        },
        {
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(createAvatarResponse.status).toBe(200);
        expect(elementResponse.status).toBe(200);
        expect(mapResponse.status).toBe(200);
    })

    test("Admin is able to update an element",async()=>{
        const elementResponse = await axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })
        
        const elementId = elementResponse.data.id;
        const updateElementResponse = await axios.put(`${API_URL}//api/v1/admin/element/${elementId}`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(updateElementResponse.status).toBe(200);
    })
    
})

//web sockets tests

describe("Websockets",()=>{
    let adminId;
    let adminToken;
    let userId;
    let userToken;
    let element1Id;
    let element2Id;
    let mapId;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages=[];
    let ws2Messages=[];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForOrPopulateMessage(messageArray){
        return new Promise(resolve=>{
            if(messageArray.length>0){
                resolve(messageArray.shift());
            } else{
                let interval = setInterval(()=>{
                    if(messageArray.length>0){
                        resolve(messageArray.shift());
                        clearInterval(interval);
                    }
                },100)
            }
        })
    }

    async function setUpHttp(){
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const signUpResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })

        adminId = signUpResponse.data.userId;

        const signinResponse = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })

        adminToken = signinResponse.data.token;

        const userSignupResponse = await axios.post(`${API_URL}/api/v1/signup`,{
            username: username + "user",
            password: "testpassword",
            type:"user"
        })

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${API_URL}/api/v1/signin`,{    
            username: username + "user",
            password: "testpassword"
        })

        userToken = userSigninResponse.data.token;

        const element1Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = axios.post(`${API_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })
        
        element1Id=element1Response.data.id;
        element2Id=element2Response.data.id;

        const mapResponse = axios.post(`${API_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element1Id,
                    x: 19,
                    y: 20
                }
            ]
        },{
            headers:{
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.data.id;

        const spaceResponse = await axios.post(`${API_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId,
        },
        {
            headers:{
                Authorization: `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.data.spaceId;
    }

    async function setUpWs(){
        ws1 = new WebSocket(`${WS_URL}/api/v1/ws`);

        await new Promise(resolve=>{
            ws1.open = resolve;
        })

        ws1.onmessage = (event)=>{
            ws1Messages.push(JSON.parse(event.data));
        }

        ws2 = new WebSocket(`${WS_URL}/api/v1/ws`);

        await new Promise(resolve=>{
            ws2.open = resolve;
        })

        ws2.onmessage = (event)=>{
            ws2Messages.push(JSON.parse(event.data));
        }
    }

    beforeAll(async()=>{
        setUpHttp();
        setUpWs(); 
    })

    test("Users should get back acknowledgement to join the space",async()=>{
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))

        const message1 = await waitForOrPopulateMessage(ws1Messages);

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        const message2 = await waitForOrPopulateMessage(ws2Messages);
        const message3 = await waitForOrPopulateMessage(ws1Messages);

        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");
        expect(message3.type).toBe("user-join");

        expect(message1.payload.users.length).toBe(0);
        expect(message2.payload.users.length).toBe(1);

        expect(message3.payload.x),toBe(message2.payload.spawn.x);
        expect(message3.payload.y),toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;
        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;

    })

    test("User should not move outside the boundary",async()=>{
        ws1.send(JSON.stringify({
            "type": "move",
            "payload": {
                "x": 1000,
                "y": 1000
            }
        }))

        const message = await waitForOrPopulateMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test("User should not be able to move 2 steps at same time",async()=>{
        ws1.send(JSON.stringify({
            "type": "move",
            "payload": {
                "x": adminX +2,
                "y": adminY
            }
        }))

        const message = await waitForOrPopulateMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test("User should able to do correct movements and broadcasted to other sockets",async()=>{
        ws1.send(JSON.stringify({
            "type": "move",
            "payload": {
                "x": adminX +1,
                "y": adminY,
                userId: adminId
            }
        }))

        const message = await waitForOrPopulateMessage(ws2Messages);
        expect(message.type).toBe("movement");
        expect(message.payload.x).toBe(adminX+1);
        expect(message.payload.y).toBe(adminY);
    })

    test("If one user leave other user should bve notified",async()=>{
        ws1.close();

        const message = await waitForOrPopulateMessage(ws2Messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(adminId);
    })
})