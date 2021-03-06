jest.dontMock('deep-freeze');
jest.dontMock('../../javascript/src/state/action-types.js');
jest.dontMock('../../javascript/src/state/gallery/reducer.js');

var galleryReducer = require('../../javascript/src/state/gallery/reducer.js');

describe('galleryReducer', () => {

    describe('ADD_FILE', () => {
        const type = 'ADD_FILE';
        const initialState = {
            count: 0,
            files: []
        }

        it('should add a single file to state', () => {
            const nextState = galleryReducer(initialState, {
                type,
                payload: {
                    file: { id: 1 }
                }
            });

            expect(nextState.files.length).toBe(1);
        });

        it('should add multiple files to state', () =>{
            const nextState = galleryReducer(initialState, {
                type,
                payload: {
                    file: [{ id: 1 }, { id: 2 }]
                }
            });

            expect(nextState.files.length).toBe(2);
        });

        it('should set `count` if passed as a param', () => {
            const nextState = galleryReducer(initialState, {
                type,
                payload: {
                    count: 1,
                    file: { id: 1 }
                }
            });

            expect(nextState.count).toBe(1);
        });

        it('should not update `count` if the param is not passed', () => {
            const nextState = galleryReducer(initialState, {
                type,
                payload: {
                    count: 1,
                    file: { id: 1 }
                }
            });

            expect(nextState.count).toBe(1);

            const nextNextState = galleryReducer(initialState, {
                type,
                payload: {
                    file: { id: 2 }
                }
            });

            expect(nextState.count).toBe(1);
        });
    });

    describe('UPDATE_FILE', () => {
        const type = 'UPDATE_FILE';
        const payload = { id: 1, updates: { title: 'updated' } };

        it('should update an existing file value', () => {
            const initialState = {
                files: [{ id: 1, title: 'initial' }]
            };

            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.files.length).toBe(1);
            expect(nextState.files[0].title).toBe('updated');
        });
    });

    describe('SELECT_FILES', () => {
        const type = 'SELECT_FILES';

        it('should select all files when no param is passed', () => {
            const initialState = {
                files: [{ id: 1 }, { id: 2 }, { id: 3 }],
                selectedFiles: [1]
            };
            const payload = { ids: null };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(3);
        });

        it('should select a single file when a file id is passed', () => {
            const initialState = { selectedFiles: [] };
            const payload = { ids: 1 };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(1);
        });

        it('should not select an already selected file', () => {
            const initialState = { selectedFiles: [1] };
            const payload = { ids: 1 };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(1);
        })

        it('should select multiple files when an array of ids is passed', () => {
            const initialState = { selectedFiles: [1] };
            const payload = { ids: [1, 2] };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(2);
        });
    });

    describe('DESELECT_FILES', () => {
        const type = 'DESELECT_FILES';
        const initialState = { selectedFiles: [1, 2, 3] };

        it('should deselect all files when no param is passed', () => {
            const payload = { ids: null };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(0);
        });

        it('should deselect a single file when a file id is passed', () => {
            const payload = { ids: 2 };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(2);
            expect(nextState.selectedFiles[0]).toBe(1);
            expect(nextState.selectedFiles[1]).toBe(3);
        });

        it('should deselect multiple files when an array of ids is passed', () => {
            const payload = { ids: [1, 3] };
            const nextState = galleryReducer(initialState, { type, payload });

            expect(nextState.selectedFiles.length).toBe(1);
            expect(nextState.selectedFiles[0]).toBe(2);
        });
    });
    
    describe('SET_EDITING', () => {
        it('should start editing the given file', () => {
            const initialState = {
                editing: false
            };

            const nextState = galleryReducer(initialState, { 
                type: 'SET_EDITING',
                payload: { file: { id: 1 } }
            });

            expect(JSON.stringify(nextState.editing)).toBe(JSON.stringify({id:1}));
        });

        it('should stop editing', () => {
            const initialState = {
                editing: { id: 1 }
            };

            const nextState = galleryReducer(initialState, { 
                type: 'SET_EDITING',
                payload: { file: false }
            });

            expect(nextState.editing).toBe(false);
        });
    });

    describe('SET_FOCUS', () => {
        it('should set focus the given file', () => {
            const initialState = {
                focus: false
            };

            const nextState = galleryReducer(initialState, { 
                type: 'SET_FOCUS',
                payload: { id: 1 }
            });

            expect(nextState.focus).toBe(1);
        });

        it('should remove', () => {
            const initialState = {
                focus: 1
            };

            const nextState = galleryReducer(initialState, { 
                type: 'SET_FOCUS',
                payload: { id: false }
            });

            expect(nextState.focus).toBe(false);
        });
    });

    describe('SET_EDITOR_FIELDS', () => {
        it('should set the state for the editor fields', () => {
            const initialState = {
                editorFields: []
            };

            const nextState = galleryReducer(initialState, { 
                type: 'SET_EDITOR_FIELDS',
                payload: {
                    editorFields: [{
                        name: 'filename',
                        title: 'name'
                    }]
                }
            });
            
            expect(JSON.stringify(nextState.editorFields)).toBe(JSON.stringify([{
                name: 'filename',
                title: 'name'
            }]));
        });
    });

    describe('UPDATE_EDITOR_FIELD', () => {
        it('should update the value of the given field', () => {
            const initialState = {
                editorFields: [{
                    name: 'filename',
                    title: 'name'
                }]
            };

            const nextState = galleryReducer(initialState, { 
                type: 'UPDATE_EDITOR_FIELD',
                payload: {
                    updates: {
                        name: 'filename',
                        title: 'filename.jpg'
                    }
                }
            });

            expect(JSON.stringify(nextState.editorFields)).toBe(JSON.stringify([{
                name: 'filename',
                title: 'filename.jpg'
            }]));
        });
    });
});
