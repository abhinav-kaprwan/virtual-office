import axios from "axios";

const API_URL = "http://localhost:3000";  // Eventually will change it 

describe("Authentication",()=>{
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

describe("User metadata Endpoint", ()=>{
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

describe("User avatar information,",()=>{
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

describe("Space information",()=>{
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
            username: "user"+Math.floor(Math.random()*1000),
            password: "testpassword",
            type:"user"
        })

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${API_URL}/api/v1/signin`,{    
            username: "user"+Math.floor(Math.random()*1000),
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

            const response = await axios.get(`${API_URL}/api/v1/space/all`)
            const filteredResponse = response.data.spaces.filter(x=>x.id == spaceCreateResponse.data.spaceId);
            expect(response.data.spaces.length).toBe(1);
            expect(filteredResponse).toBeDefined();
    })
})